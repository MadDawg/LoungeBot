"use strict";

// TODO: consider moving anything that doesn't handle or rely on persistence
// to other files

const Discord = require('discord.js');
const fs = require('fs');
const https = require('https');
const parse = require('url-parse');
const winston = require('winston');
const { indexes, imageboards, videos, communities, communities2, domain_exclusions } = require('./saucenao_objects.js');
const http_status_codes = require('../resources/http_status_codes.json');
const api_key = require('../config.json').saucenao_api_key;

// serverdb is the array of objects representing guild IDs
// and their configured command prefixes

class LoungeBot{
    constructor(){
        this.logger = winston.createLogger({
            levels: winston.config.syslog.levels,
            transports: [
                new winston.transports.Console(),
                //new winston.transports.File({ filename: 'log' }),
            ],
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                //winston.format.colorize(),
                winston.format.printf(log => {
                    if (log.stack){
                        return `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message} - ${log.stack}`;
                    }
                    return `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`;
                }),
            ),
        });

        try{
            this._serverdb = require('../serverdb.json');
        }
        catch(err){
            this._serverdb = [];
        }
    }

    //------ DATABASE METHODS ------
    // database contains:
    // - guild IDs
    // - command prefixes
    // - botspam channels
    // - autosauce channels
    // - watchghostping boolean

    // expected string format: [{"guildid":"", "prefix":"", "botspam":[], "autosauce":[], "watchghostpings":""}]

    // write to file
    writeOut(){
        const data = JSON.stringify(this._serverdb);
        const callback = function(){}; // kludge(?) to avoid deprecation warning
        try{
            fs.writeFile('./serverdb.json', data, 'utf8', callback);
        }
        catch(err){ this.logger.error(err); }
        return;
    }
    initDB(guildid, options){
        this._serverdb.push({
            "guildid": guildid,
            "prefix": options.prefix,
            "botspam": options.botspam,
            "autosauce": options.autosauce,
            "watchghostpings": options.watchghostpings
        });
    }

    // check if guild exists in database
    checkDB(guildid){
        if (!this._serverdb.find(x => x.guildid === guildid)){
            this.initDB(guildid, {
                prefix: "lb!",
                botspam: [],
                autosauce: [],
                watchghostpings: "false" // currently string as we are storing in JSON
            });
        }
    }

    getPrefix(prefix, guildid){
        try{
            return this._serverdb.find(x => x.guildid === guildid).prefix;
        }
        catch(err){ return prefix; }
    }

    changePrefix(newprefix, oldprefix, guildid){
        // avoid writing to filesystem if prefix doesn't change
        if (newprefix !== oldprefix){
            this.checkDB(guildid);
            this._serverdb.find(x => x.guildid === guildid).prefix = newprefix;
            this.writeOut();
        }
        return newprefix;
    }

    // Add/remove/check/list bot-spam channels
    addBotSpam(channels, guildid){
        let botspam = this.getBotSpam(guildid);
        const messages = [];
        for(let i = 0; i < channels.length; i++){
            const channel = channels[i];
            if (this.isBotSpam(channel.id, guildid)){
                messages.push(`${channel.toString()} is already marked as bot-spam.`);
            }
            else{
                messages.push(`${channel.toString()} marked as bot-spam.`);
                botspam.push(channel.id);
            }
        }

        this.writeOut();
        return messages.join('\n');
    }

    removeBotSpam(channels, guildid){
        let botspam = this.getBotSpam(guildid);
        const messages = [];
        for (let i = 0; i < channels.length; i++){
            const channel = channels[i];
            let index = botspam.indexOf(channel.id);
            if(index > -1){
                botspam.splice(index, 1);
                messages.push(`${channel.toString()} is no longer marked as bot-spam.`);
            } else { messages.push(`${channel.toString()} is not marked as bot-spam.`); }
        }

        this.writeOut();
        return messages.join('\n');
    }

    // check if channel is marked as bot-spam
    isBotSpam(channel, guildid){
        //this.checkDB(guildid);

        //let botspam = this._serverdb.find(x => x.guildid === guildid).botspam;
        let botspam = this.getBotSpam(guildid);
        let index = botspam.indexOf(channel);

        return index > -1;
    }

    // get bot-spam channels
    getBotSpam(guildid){
        this.checkDB(guildid);
        return (this._serverdb.find(x => x.guildid === guildid).botspam);
    }

    // --------- Sauce/source related stuff -------------
    addAutoSauce(channels, guildid){
        let autosauce = this.getAutoSauce(guildid);
        const messages = [];
        for(let i = 0; i < channels.length; i++){
            const channel = channels[i];
            if (this.isAutoSauce(channel.id, guildid)){
                messages.push(`${channel.toString()} is already marked for auto-sauce.`);
            } else {
                messages.push(`${channel.toString()} marked as auto-sauce.`);
                autosauce.push(channel.id);
            }
        }

        this.writeOut();
        return messages.join('\n');
    }

    removeAutoSauce(channels, guildid){
        let autosauce = this.getAutoSauce(guildid);
        const messages = [];
        for (let i = 0; i < channels.length; i++){
            const channel = channels[i];
            let index = autosauce.indexOf(channel.id);
            if(index > -1){
                autosauce.splice(index, 1);
                messages.push(`${channel.toString()} is no longer marked for auto-sauce.`);
            } else { messages.push(`${channel.toString()} is not marked for auto-sauce.`); }
        }
        this.writeOut();
        return messages.join('\n');
    }

    isAutoSauce(channel, guildid){
        //this.checkDB(guildid);
        //let autosauce = this._serverdb.find(x => x.guildid === guildid).autosauce;
        let autosauce = this.getAutoSauce(guildid);
        let index = autosauce.indexOf(channel);

        return index > -1;
    }

    getAutoSauce(guildid){
        this.checkDB(guildid);
        return (this._serverdb.find(x => x.guildid === guildid).autosauce);
    }

    // TODO: expand to more than just pixiv
    get_pixiv_id(img){
        const file_regex = /(\d+)_p\d+/;
        const url_regex = /\/(\d+)$/;
        let regex = undefined;
        //console.log(parse(img));
        if (parse(img).hostname === "i.pximg.net"){ regex = url_regex; }
        else{ regex = file_regex; }

        const id = img.match(regex);
        if (id && id.length){
            const url = `https://pixiv.net/artworks/${id[1]}`;
            return url;
        }
        return "";
    }
    // create embeds
    // we probably don't need the indexes parameter here but eh...
    // there are a lot of leaps of faith here (we don't know which fields can end up blank)
    constructSauceDispenser(results, indexes, minsim, manually_invoked){
        const embeds = [];

        for (let i = 0; i < results.length; i++){
            const result = results[i];
            const similarity = parseFloat(result.header.similarity);
            // minsim doesn't seem to work in SauceNAO's API for some reason,
            // so we'll check it ourself
            if (similarity < parseFloat(minsim)){
                break; // bail out
            }

            const embed = new Discord.MessageEmbed();
            // add result header data
            if (manually_invoked){ embed.setTitle("Result"); }
            else { embed.setTitle("Best Guess for This Image"); }

            embed.setThumbnail(encodeURI(result.header.thumbnail));
            embed.addField("Similarity", `${result.header.similarity}%`);
            if (result.data.ext_urls)
                embed.setURL(result.data.ext_urls[0]);

            if (similarity > 69){ embed.setColor('#00FF00'); }
            else if (similarity > 49){ embed.setColor('#FFFF00'); }
            else{ embed.setColor('#FF0000'); }

            embed.setFooter("Sauce provided by SauceNAO");
            // add other result data

            if (communities.includes(result.header.index_id)){
                if (result.data.title)
                    embed.addField("Title", result.data.title);
                if (result.data.member_name)
                    embed.addField("Creator/Member", result.data.member_name);
            }
            else if (communities2.includes(result.header.index_id)){
                if (result.data.title)
                    embed.addField("Title", result.data.title);
                if (result.data.author_name)
                    embed.addField("Author", result.data.author_name);
            }
            else if (videos.includes(result.header.index_id)) {
                embed.addField("Source", result.data.source);
                embed.addField("Year", result.data.year);
                if (result.data.part)
                    embed.addField("Episode/Part", result.data.part);
                embed.addField("Estimated Time", result.data.est_time);
            }
            else if (imageboards.includes(result.header.index_id)){
                if (result.data.creator)
                    embed.addField("Creator", result.data.creator);
                if (result.data.material)
                    embed.addField("Material", result.data.material);
                if (result.data.characters)
                    embed.addField("Characters", result.data.characters);
                if (result.data.source){
                    // if the source is a Pixiv link, convert it to something
                    // that won't return an HTTP 403
                    const regex = /\/(\d+)$/;
                    let source = result.data.source;
                    if (parse(source).hostname === "i.pximg.net"){
                        const id = source.match(regex);
                        if (id && id.length)
                            source = `https://pixiv.net/artworks/${id[1]}`;
                    }
                    embed.addField("Source (according to users)", source);
                }
            }
            else{
                switch(result.header.index_id){
                    case indexes['hmags']:
                        embed.addField("Title", result.data.title);
                        embed.addField("Episode/Part", result.data.part);
                        embed.addField("Date", result.data.date);
                    break;

                    case indexes['hcg']:
                        embed.addField("Title", result.data.title);
                        embed.addField("Company", result.data.company);
                    break;

                    //case indexes['hmisc']:
                    case 18: case 38:
                        embed.addField("Title", result.data.source);
                        if (result.data.creator.length <= 5)
                            embed.addField("Creator", result.data.creator.join('\n'));
                        else
                            embed.addField("Creator", `${result.data.creator[0]} and ${result.data.creator.length-1} others`);

                        if (result.data.eng_name)
                            embed.addField("English Name", result.data.eng_name);
                        if (result.data.jp_name)
                            embed.addField("Japanese Name", result.data.jp_name);
                    break;

                    case indexes['2dmarket']: case indexes['fakku']:
                        embed.addField("Source", result.data.source);
                        embed.addField("Creator", result.data.creator);
                    break;

                    case indexes['pawoo']:
                        embed.addField("User", result.data.pawoo_user_acct);
                        embed.addField("User Display Name", result.data.pawoo_user_display_name);
                    break;

                    case indexes['madokami']: case indexes['mangadex']:
                        embed.addField("Source", result.data.source);
                        // can be tacky and would be annoying to fix.
                        embed.addField("Part/Chapter", result.data.source);
                    break;

                    case indexes['twitter']:
                        embed.addField("Twitter User", result.data.twitter_user_handle);
                    break;

                    // could not find results that returned these;
                    // will need to ask staff for fields
                    case indexes['doujindb']:
                    case indexes['portalgraphics']:
                    case indexes['shutterstock']:
                    case indexes['animepictures']:
                        this.logger.error(`Result references unimplemented index: ${result.header.index_id}`);
                        // couldn't actually get a result that returned this site,
                        // but it looks like it'd yield the same results as the other
                        // imageboards
                        break;
                    //case indexes['ALL']:
                    default:
                        this.logger.error(`Result references unknown index: ${result.header.index_id}`);
                    break;
                }
            }
            embeds.push(embed);
        }

        // TODO: why limit ourselves to pixiv?
        // if the first autosauce result is a pixiv result,
        // attempt find the oldest submission in the hopes
        // of avoiding reuploads
        if (!manually_invoked &&
            embeds.length &&
            embeds[0].url &&
            embeds[0].url.startsWith("https://www.pixiv.net/")){

            let better_index = 0;
            // compare uploaders to prevent false positive (variations from same artist)
            // NOTE: hardcoded fields[2] will cause problems later
            let uploader = embeds[0].fields[2].value;
            let better_url = embeds[0].url;
            for(let i = 0; i < embeds.length; i++){
                // TODO: check similarity!
                if (embeds[i].url &&
                    embeds[i].url.startsWith("https://www.pixiv.net/") &&
                    embeds[i].url < better_url &&
                    embeds[i].fields[2].value !== uploader){

                    better_index = i;
                    better_url = embeds[i].url;
                }
            }

            if (better_index){
                const regex = /=(\d+)$/;
                const id = better_url.match(regex);
                if (id && id.length){
                    better_url = `https://pixiv.net/artworks/${id[1]}`;
                }

                embeds[0].addField("Note", `Possible reupload of ${better_url}`);
            }
        }

        return embeds;
    }
    // what we have now gets more awkward the larger the image dump is

    // options:
    // args (array)
    // manually_invoked (boolean) // maybe remove this as an option (use as plain parameter instead)
    // numres (string)
    // minsim (string)
    getSauce(message, options){
        let imgurl = "";
        let msg = "";
        let urls = "";
        let spoiler = false;
        if (options.manually_invoked){
            // check if urls are seperated by newline instead of whitespace/tab
            // and also store the result (we only care about the first url for now)
            // TODO: just drop links in case of image dump

            // TODO: consider moving these checks to sauce.js
            if (options.args.length){
                // store urls in a set to avoid dupes
                urls = Array.from(new Set(options.args[0].split("\n")));
                imgurl = urls[0];
            }
            else {
                try{
                    imgurl = message.attachments.first().url
                }
                catch(err){}
            }
        }
        else{
            // TODO: cleanup (and maybe rewrite) this block
            // currently only allow one image per message
            // https://urlregex.com/
            const regex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)/;
            const spoiler_regex = new RegExp("\\|\\|" + regex.source + "\\|\\|");
            let urls = message.content.match(spoiler_regex);
            if (!urls){ urls = message.content.match(regex); }
            else{ spoiler = true; }

            if (urls){
                if (spoiler){
                    imgurl = message.content.match(regex)[0];
                }
                else { imgurl = urls[0]; }

                // check if query contains more than one url
                //const urls_input = Array.from(new Set(urls.input.split("\n")));
            }
            else{
                // looks like discord only allows one attachment per message if
                // sent by a normal user
                try{
                    imgurl = message.attachments.first().url;
                    if (message.attachments.first().spoiler){
                        spoiler = true;
                    }
                }
                catch(err){ return; } // no images found; nothing to do
            }
        }


        if (domain_exclusions.includes(parse(imgurl, true).hostname) && !options.manually_invoked){
            this.logger.notice(`URL ${imgurl} excluded from search`);
            return;
        }

        // check if channel is NSFW and adjust SauceNAO URL accordingly
        let hidelevel = "3";
        if (message.channel.nsfw){ hidelevel = "0"; }
        //const dbmask = 0000000;
        const db = "999"; // will likely always be 999
        const output_type = "2";
        const testmode = "0";
        //const numres = 1;

        // minimum similarity
        // should be good enough for now
        //let minsim = "85!";
        const url = `https://saucenao.com/search.php?db=${db}&hidelevel=${hidelevel}&output_type=${output_type}&testmode=${testmode}&numres=${options.numres}&minsim=${options.minsim}&url=${imgurl}&api_key=${api_key}`;
        // fallback url in case the server gives a 429 or some other error
        const fallback_url = `https://saucenao.com/search.php?db=${db}&hidelevel=${hidelevel}&url=${imgurl}`;

        // https://www.twilio.com/blog/2017/08/http-requests-in-node-js.html
        https.get(url, (resp) => {
            const status_msg = http_status_codes;
            if (resp.statusCode !== 200){
                if (resp.statusCode === 403){
                    this.logger.crit("SauceNAO received invalid API key");
                    return;
                }
                else{
                    const error_msg = `SauceNAO returned **${resp.statusCode} ${status_msg[String(resp.statusCode)]}**`;
                    let nsfw_warning = "";
                    if (!message.channel.nsfw){ nsfw_warning = "(may or may not be NSFW)"; }
                    const embed = new Discord.MessageEmbed();
                    embed.setTitle("Search Failed");
                    embed.setDescription(error_msg);
                    embed.addField("Fallback URL", `[SauceNAO results page](${fallback_url}) ${nsfw_warning}`);
                    const filename_guess = this.get_pixiv_id(url);
                    if (filename_guess){
                        embed.addField("Filename Guess", filename_guess);
                    }
                    this.logger.warning(error_msg);
                    return message.channel.send(embed);
                }
            }

            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received.
            resp.on('end', () => {
                let results = [];
                const header = JSON.parse(data).header;

                if (header.status > 0){
                    const error_msg = "SauceNAO API Error. Try again.";
                    this.logger.warning(error_msg);
                    if (options.manually_invoked){
                        return message.reply('', {embed: {description: error_msg}});
                    }
                    return;
                }
                else if (header.status < 0){
                    if (header.message){
                        const error_msg = `Search failed with message: \`\`${header.message}\`\``;
                        this.logger.warning(error_msg);
                        if (options.manually_invoked){
                            return message.reply('', {embed: {description: error_msg}});
                        }
                        return;
                    }
                    this.logger.warning("Bad image or other request error. Try a different image or try just again later.");
                    return;
                }

                // TODO: add remaining API searches (long_remaining)
                results = JSON.parse(data).results;
                // should never fail with workaround in place, but we'll leave it just in case
                if (!results){
                    const error_msg = "SauceNAO reported successful search but returned no results.";
                    this.logger.error(error_msg);
                    if (options.manually_invoked){
                        return message.reply('', {embed: {description: error_msg}});
                    }
                    return;
                }

                const embeds = this.constructSauceDispenser(results, indexes, options.minsim, options.manually_invoked);
                for (let i = 0; i < embeds.length; i++){
                    // TODO: figure out how to hide embeds behind spoiler
                    /*if (spoiler){ message.channel.send("||Spoiler revealed!||", embeds[i]); }
                    else{ message.channel.send(embeds[i]); }*/
                    message.channel.send(embeds[i]);
                    // workaround for issue caused by numres sometimes seemingly breaking when set to 1
                    // to get single result, we just ask for 2 or so then only
                    // show the first one
                    if (!options.manually_invoked) break;
                }
                if (!embeds.length && options.manually_invoked){
                    const embed = new Discord.MessageEmbed();
                    embed.setDescription(`No suitable matches found for: ${imgurl}`);
                    message.channel.send(embed);
                }
                if (msg){
                    message.channel.send(msg);
                }
              });

        }).on("error", (err) => {
            this.logger.error(err.message);
        });
    }

    // --------------------------
}

module.exports = LoungeBot;

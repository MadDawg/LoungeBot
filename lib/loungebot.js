"use strict";

//TODO: this file may be deprecated at this point
//TODO: should update RichEmbed to MessageEmbed,
// but we're lazy so we'll do it later

const Discord = require('discord.js');
const fs = require('fs');
const https = require('https');
const parse = require('url-parse');
const { saucenao_indexes, imageboards, videos, communities } = require('./saucenao_indexes.js');
const http_status_codes = require('../resources/http_status_codes.json');

// serverdb is the array of objects representing guild IDs
// and their configured command prefixes

class LoungeBot{
    constructor(){
       try{
           // We should probably be using fs for this but eh...
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
        const callback = function(){} // kludge(?) to avoid deprecation warning
        try{
            fs.writeFile('./serverdb.json', data, 'utf8', callback);
        }
        catch(err){ console.error(err); }
        return;
    }
    initDB(guildid, prefix="lb!", botspam=[], autosauce=[], watchghostpings="false"){
        this._serverdb.push({"guildid": guildid, "prefix": prefix, "botspam": botspam, "autosauce": autosauce, "watchghostpings":watchghostpings});
    }

    // check if guild exists in database
    checkDB(guildid){
        if (!this._serverdb.find(x => x.guildid === guildid)){ this.initDB(guildid); }
    }

    initPrefix(prefix, guildid){
        try{
            return this._serverdb.find(x => x.guildid === guildid).prefix;
        }
        catch(err){
            return prefix;
        }
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
    addBotSpam(channel, guildid){
        this.checkDB(guildid);
        let botspam = this._serverdb.find(x => x.guildid === guildid).botspam;

        if (this.isBotSpam(channel, guildid)){ return "Channel is already marked as bot-spam."; }

        botspam.push(channel);
        this.writeOut();
        return "Channel marked as bot-spam.";
    }

    removeBotSpam(channel, guildid){
        this.checkDB(guildid);

        let botspam = this._serverdb.find(x => x.guildid === guildid).botspam;
        let index = botspam.indexOf(channel);

        if(index > -1){
            botspam.splice(index, 1);
            this.writeOut();
            return "Channel is no longer marked as bot-spam.";
        }
        return "Channel is not marked as bot-spam.";
    }

    // check if channel is marked as bot-spam
    isBotSpam(channel, guildid){
        this.checkDB(guildid);

        let botspam = this._serverdb.find(x => x.guildid === guildid).botspam;
        let index = botspam.indexOf(channel);

        return index > -1;
    }

    // Be careful to not modify the array on accident!
    // get bot-spam channels
    getBotSpam(guildid){
        this.checkDB(guildid);
        return (this._serverdb.find(x => x.guildid === guildid).botspam);
    }

    addAutoSauce(channel, guildid){
        this.checkDB(guildid);
        let autosauce = this._serverdb.find(x => x.guildid === guildid).autosauce;

        if (this.isAutoSauce(channel, guildid)){ return "Channel is already marked for auto-sauce."; }

        autosauce.push(channel);
        this.writeOut();
        return "Channel marked for auto-sauce.";

    }
    removeAutoSauce(channel, guildid){
        this.checkDB(guildid);
        let autosauce = this._serverdb.find(x => x.guildid === guildid).autosauce;
        let index = autosauce.indexOf(channel);

        if(index > -1){
            autosauce.splice(index, 1);
            this.writeOut();
            return "Channel is no longer marked for auto-sauce.";
        }
        return "Channel is not marked autosauce.";
    }
    isAutoSauce(channel, guildid){
        this.checkDB(guildid);
        // TODO: fix redundant find() call when called from addAutoSauce()
        let autosauce = this._serverdb.find(x => x.guildid === guildid).autosauce;
        let index = autosauce.indexOf(channel);

        return index > -1;
    }
    getAutoSauce(guildid){
        this.checkDB(guildid);
        return (this._serverdb.find(x => x.guildid === guildid).autosauce);
    }
    constructSauceDispenser(results, indexes){
        const embeds = [];

        // fallback for status code mismatch
        try{
            !results[0];
        }
        catch(TypeError){
            console.error("Somehow this error was not caught earlier...");
            return [];
        }
        results.forEach((result, i) => {
            const similarity = parseFloat(result.header.similarity);

            const embed = new Discord.RichEmbed();
            // add result header data
            embed.setTitle("Best Guess for This Image");
            embed.setThumbnail(result.header.thumbnail);
            embed.addField("Similarity", `${result.header.similarity}%`);
            if (result.data.ext_urls)
                embed.setURL(result.data.ext_urls[0]);

            if (similarity > 69)
                embed.setColor('#00FF00');
            else if (similarity > 49)
                embed.setColor('#FFFF00');
            else
                embed.setColor('#FF0000');

            embed.setFooter("Sauce provided by SauceNao");
            // add other result data

            if (communities.includes(results.header.index_id)){
                embed.addField("Title", result.data.title);
                embed.addField("Creator/Member", result.data.member_name);
            }
            else if (videos.includes(results.header.index_id)) {
                embed.addField("Source", result.data.source);
                embed.addField("Year", result.data.year);
                if (result.data.part)
                    embed.addField("Episode/Part", result.data.part);
                embed.addField("Estimated Time", result.data.est_time);
            }
            else if (imageboards.includes(results.header.index_id){
                embed.addField("Creator", result.data.creator);
                if (result.data.material)
                    embed.addField("Material", result.data.material);
                if (result.data.characters)
                    embed.addField("Characters", result.data.characters);
            }
            else{
                switch(result.header.index_id){
                    case indexes['deviantart']:
                        embed.addField("Title", result.data.title);
                        embed.addField("Author", result.data.author_name);
                    break;

                    case indexes['hmags']:
                        embed.addField("Title", result.data.title);
                        embed.addField("Episode/Part", result.data.part);
                        embed.addField("Date", result.data.date);
                    break;

                    case indexes['hcg']:
                        embed.addField("Title", result.data.title);
                        embed.addField("Company", result.data.company);
                    break;

                    case indexes['hmisc']:
                        embed.addField("Title", result.data.source);
                        if (result.data.creator.length <= 5)
                            embed.addField("Creator", result.data.creator.join('\n'));
                        else
                            embed.addField("Creator", `${result.data.creator[0]} and ${result.data.creator.length} others`);

                        if (result.data.en_name)
                            embed.addField("English Name", result.data.en_name);
                        if (result.data.jp_name)
                            embed.addField("Japanese Name", result.data.jp_name);
                    break;

                    case indexes['2dmarket']: case indexes['fakku']:
                        embed.addField("Source", result.data.source);
                        embed.addField("Creator", result.data.creator);
                    break;

                    case indexes['pawoo']:
                        embed.addField("User", result.data.pawoo_user_acct);
                        embed.addField("User Display Name", results.data.pawoo_user_display_name);
                    break;

                    case indexes['madokami']: case indexes['mangadex']:
                        embed.addField("Source", result.data.source);
                        // can be tacky and would be annoying to fix.
                        embed.addField("Part/Chapter", result.data.source);
                    break;

                    // could not find results that returned these;
                    // will need to ask staff for fields
                    case indexes['doujindb']:
                        break;
                    case indexes['portalgraphics']:
                        break;
                    case indexes['shutterstock']:
                        break;
                    case indexes['animepictures']:
                    // couldn't actually get a result that returned this site,
                    // but it looks like it'd yield the same results as the other
                    // imageboards
                    break;
                    //case indexes['ALL']:
                    default:
                        console.log("how tho?");
                    break;
                }
            }
            embeds.push(embed);
        });
        return embeds;
    }
    getSauce(message, numres=1, minsim="85!"){
        // this regex may get recomplied every invokation?
        // https://urlregex.com/
        const regex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
        // return if there is no url

        const urls = message.content.match(regex);
        let imgurl = "";
        if (urls){
            imgurl = urls[0];
        }
        else{
            try{
                imgurl = message.attachments.first().url;
            }
            catch(err){ return; }
        }

        // check if channel is NSFW and adjust SauceNao URL accordingly
        let hidelevel = "3";
        if (message.channel.nsfw){ hidelevel = "0"; }
        //const dbmask = 0000000;
        const db = 999; // will likely always be 999
        const output_type = 2;
        const testmode = 0;
        //const numres = 1;

        // minimum similarity
        // should be good enough for now
        //let minsim = "85!";
        const url = `https://saucenao.com/search.php?db=${db}&hidelevel=${hidelevel}&output_type=${output_type}&testmode=${testmode}&numres=${numres}&minsim=${minsim}&url=${imgurl}`;
        // fallback url in case the server gives a 429 or some other error
        const fallback_url = `https://saucenao.com/search.php?db=${db}&hidelevel=${hidelevel}&url=${imgurl}`;

        // broken indexes/indices included
        const indexes = saucenao_indexes;

        https.get(url, (resp) => {
            const status_msg = http_status_codes;
            if (resp.statusCode !== 200){
                if (resp.statusCode === 403){
                    console.error("Server recieved invalid API key");
                    return;
                }
                else{
                    // TODO: contruct embed containing fallback_url
                    console.error(`Server returned ${resp.statusCode} ${status_msg[String(resp.statusCode)]}`);
                    return;
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
                //console.log(header.status);

                if (header.status > 0){
                    console.error("API Error. Try again later.");
                    return;
                }
                else if (header.status < 0){
                    if (header.message){
                        console.error(`Search failed with message "${header.message}"`);
                        return;
                    }
                    console.error("Bad image or other request error. Try a different image or try just again later.");
                    return;
                }

                results = JSON.parse(data).results;

                const embeds = this.constructSauceDispenser(results, indexes);
                for (let i = 0; i < embeds.length; i++){
                    message.channel.send(embeds[i]);
                }
              });

        }).on("error", (err) => {
            console.error("Error: " + err.message);
        });
    }

    // --------------------------
}

module.exports = LoungeBot;
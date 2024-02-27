"use strict"

import parse from 'url-parse'; // TODO: replace with node:url
// import { URL } from 'node:url'
import { fileTypeFromStream as fromStream } from 'file-type';
import { get } from 'https'; // TODO: either just use https, or just use got
import got from 'got';
const _stream = got.stream;

import { EmbedBuilder } from 'discord.js';

import { createLogger, config, transports as _transports, format as _format } from 'winston';
import envs from '../config.js';
const api_key = envs.SAUCENAO_API_KEY;

import { indexes, imageboards, videos, communities, communities2, domain_exclusions } from './saucenao_objects.js';
import http_status_codes from '../resources/http_status_codes.js';

// we can also just pass in datamanager's logger instance as a parameter
const logger = createLogger({
    levels: config.syslog.levels,
    transports: [
        new _transports.Console(),
        //new winston.transports.File({ filename: 'log' }),
    ],
    format: _format.combine(
        _format.timestamp(),
        _format.errors({ stack: true }),
        //winston.format.colorize(),
        _format.printf(log => {
            if (log.stack){
                return `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message} - ${log.stack}`;
            }
            return `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`;
        }),
    ),
});

const saucenaoTimeout = {
    duration: -1,
    short: true
};

// TODO: expand to more than just pixiv
function getPixivID(img) {
    const file_regex = /(\d+)_p\d+/;
    const url_regex = /\/(\d+)$/;
    let regex = undefined;
    //console.log(parse(img));
    if (parse(img).hostname === "i.pximg.net") { regex = url_regex; }
    else { regex = file_regex; }

    const id = img.match(regex);
    if (id && id.length) {
        const url = `https://pixiv.net/artworks/${id[1]}`;
        return url;
    }
    return "";
}
// create embeds
// we probably don't need the indexes parameter here but eh...
// there are a lot of leaps of faith here (we don't know which fields can end up blank)
function constructSauceDispenser(results, indexes, minsim, manually_invoked) {
    const embeds = [];

    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const similarity = parseFloat(result.header.similarity);
        // minsim doesn't seem to work in SauceNAO's API for some reason,
        // so we'll check it ourself
        if (similarity < parseFloat(minsim)) {
            break; // bail out
        }

        const embed = new EmbedBuilder();
        // add result header data
        if (manually_invoked) { embed.setTitle("Result"); }
        else { embed.setTitle("Best Guess for This Image"); }

        embed.setThumbnail(encodeURI(result.header.thumbnail));
        embed.addFields({ name: "Similarity", value: `${result.header.similarity}%` });
        if (result.data.ext_urls)
            embed.setURL(result.data.ext_urls[0]);

        if (similarity > 69) { embed.setColor('#00FF00'); }
        else if (similarity > 49) { embed.setColor('#FFFF00'); }
        else { embed.setColor('#FF0000'); }

        embed.setFooter({ text: "Sauce provided by SauceNAO" });
        // add other result data

        if (communities.includes(result.header.index_id)) {
            if (result.data.title)
                embed.addFields({ name: "Title", value: result.data.title });
            if (result.data.member_name)
                embed.addFields({ name: "Creator/Member", value: result.data.member_name });
        }
        else if (communities2.includes(result.header.index_id)) {
            if (result.data.title)
                embed.addFields({ name: "Title", value: result.data.title });
            if (result.data.author_name)
                embed.addFields({ name: "Author", value: result.data.author_name });
        }
        else if (videos.includes(result.header.index_id)) {
            embed.addFields({ name: "Source", value: result.data.source });
            embed.addFields({ name: "Year", value: result.data.year });
            if (result.data.part)
                embed.addFields({ name: "Episode/Part", value: result.data.part });
            embed.addFields({ name: "Estimated Time", value: result.data.est_time });
        }
        else if (imageboards.includes(result.header.index_id)) {
            if (result.data.creator)
                embed.addFields({ name: "Creator", value: result.data.creator });
            if (result.data.material)
                embed.addFields({ name: "Material", value: result.data.material });
            if (result.data.characters)
                embed.addFields({ name: "Characters", value: result.data.characters });
            if (result.data.source) {
                // if the source is a Pixiv link, convert it to something
                // that won't return an HTTP 403
                const regex = /\/(\d+)$/;
                let source = result.data.source;
                if (parse(source).hostname === "i.pximg.net") {
                    const id = source.match(regex);
                    if (id && id.length)
                        source = `https://pixiv.net/artworks/${id[1]}`;
                }
                embed.addFields({ name: "Source (according to users)", value: source });
            }
        }
        else {
            switch (result.header.index_id) {
                case indexes['hmags']:
                    embed.addFields({ name: "Title", value: result.data.title });
                    embed.addFields({ name: "Episode/Part", value: result.data.part });
                    embed.addFields({ name: "Date", value: result.data.date });
                    break;

                case indexes['hcg']:
                    embed.addFields({ name: "Title", value: result.data.title });
                    embed.addFields({ name: "Company", value: result.data.company });
                    break;

                //case indexes['hmisc']:
                case 18: case 38:
                    embed.addFields({ name: "Title", value: result.data.source });
                    if (result.data.creator.length <= 5)
                        embed.addFields({ name: "Creator", value: result.data.creator.join('\n') });
                    else
                        embed.addFields({ name: "Creator", value: `${result.data.creator[0]} and ${result.data.creator.length - 1} others` });

                    if (result.data.eng_name)
                        embed.addFields({ name: "English Name", value: result.data.eng_name });
                    if (result.data.jp_name)
                        embed.addFields({ name: "Japanese Name", value: result.data.jp_name });
                    break;

                case indexes['2dmarket']: case indexes['fakku']:
                    embed.addFields({ name: "Source", value: result.data.source });
                    embed.addFields({ name: "Creator", value: result.data.creator });
                    break;

                case indexes['pawoo']:
                    embed.addFields({ name: "User", value: result.data.pawoo_user_acct });
                    embed.addFields({ name: "User Display Name", value: result.data.pawoo_user_display_name });
                    break;

                case indexes['madokami']:
                    embed.addFields({ name: "Source", value: result.data.source });
                    embed.addFields({ name: "Part", value: result.data.part });
                    break;

                /*case indexes['mangadex']:*/
                case 37: case 371:
                    embed.addFields({ name: "Source", value: result.data.source + result.data.part });
                    // can be tacky and would be annoying to fix.
                    //embed.addFields({name: "Part/Chapter", value: result.data.part});
                    embed.addFields({ name: "Author", value: result.data.author });
                    embed.addFields({ name: "Artist", value: result.data.artist });
                    break;

                case indexes['twitter']:
                    embed.addFields({ name: "Twitter User", value: result.data.twitter_user_handle });
                    break;

                // TODO: somehow get kemono link
                case indexes['kemono']:
                    //embed.setURL(``); // set URL to link to Kemono page instead of original
                    embed.addFields({ name: "Title", value: result.data.title });
                    embed.addFields({ name: "User", value: result.data.user_name });
                    embed.addFields({ name: "Service", value: result.data.service_name });
                    //embed.addFields({name: "Original Pixiv Fanbox source", value: result.data.ext_urls[0]});
                    break;

                case indexes['skeb']:
                    embed.addFields({ name: "Creator", value: result.data.creator_name });
                    break;


                // could not find results that returned these;
                // will need to ask staff for fields
                case indexes['doujindb']:
                case indexes['portalgraphics']:
                case indexes['shutterstock']:
                    logger.error(`Result references unimplemented index: ${result.header.index_id}`);
                    break;
                //case indexes['ALL']:
                default:
                    logger.error(`Result references unknown index: ${result.header.index_id}`);
                    break;
            }
        }
        embeds.push(embed);
    }

    // TODO: why limit ourselves to pixiv?
    // TODO: do this search earlier so we don't have to rely soly on usernames (which can be rendered in different languages)
    // attempt find the oldest submission in the hopes
    // of identifying reuploads
    let better_index = 0;
    let better_url = "";
    let uploader = "";

    for (let i = 0; i < embeds.length; i++) {
        // TODO: check similarity!
        if (embeds[i].url && embeds[i].url.startsWith("https://www.pixiv.net/fanbox")) { continue; } // avoid marking fanbox submissions as reuploads

        if (embeds[i].url &&
            embeds[i].url.startsWith("https://www.pixiv.net/") &&
            (embeds[i].url < better_url || better_url === "")) {

            // NOTE: hardcoded fields[2] will surely cause problems later
            uploader = embeds[i].fields[2].value;
            better_index = i;
            better_url = embeds[i].url;
        }
    }

    if (better_url === "") { return embeds; } // nothing to do, so just return

    const regex = /=(\d+)$/;
    const id = better_url.match(regex);
    if (id && id.length) {
        better_url = `https://pixiv.net/artworks/${id[1]}`;
    }

    for (let i = 0; i < embeds.length; i++) {
        if (embeds[i].url && embeds[i].url.startsWith("https://www.pixiv.net/fanbox")) { continue; } // avoid marking fanbox submissions as reuploads

        if (/*better_index &&*/
            embeds[i].url &&
            embeds[i].url.startsWith("https://www.pixiv.net/") &&
            embeds[i].url > better_url &&
            embeds[i].fields[2].value !== uploader) {

            embeds[i].addFields({ name: "Note", value: `Possible reupload of ${better_url}` });
        }
    }

    return embeds;
}

function humanReadableDuration(date) {
    const hourConstant = 3.6e06;
    const minuteConstant = 6e04;
    const secondConstant = 1000;

    const rawDuration = date - Date.now();
    let duration = "";
    let hourString = " hours ";
    let minuteString = " minutes ";
    let secondString = " seconds";

    let hours = Math.floor(rawDuration / hourConstant);
    let minutes = Math.floor((rawDuration % hourConstant) / minuteConstant);
    let seconds = Math.floor(((rawDuration % hourConstant) % minuteConstant) / secondConstant);

    if (hours === 1) hourString = " hour ";
    if (minutes === 1) minuteString = " minute ";
    if (seconds === 1) secondString = " second";

    // not my style but this is easy...
    if (hours === 0) {
        hours = "";
        hourString = "";
    }

    if (minutes === 0) {
        minutes = "";
        minuteString = "";
    }

    if (seconds === 0) {
        seconds = "";
        secondString = "";
    }

    duration += hours + hourString + minutes + minuteString + seconds + secondString;

    return duration;
}

/*function validateImageUrl(imgurl){
    const url_regex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
    return url_regex.test(imgurl);
}*/

// options:
// args (array)
// manually_invoked (boolean) // maybe remove this as an option (use as plain parameter instead)
// numres (string)
// minsim (string)
async function getSauce(message, options) {
    let imgurl = "";
    // let msg = "";
    let urls = "";
    let spoiler = false;
    let attachment = false;


    if (saucenaoTimeout.duration - Date.now() > 0) {
        const embed = new EmbedBuilder();
        if (saucenaoTimeout.short) {
            embed.setDescription(`Too many searches within 30 seconds. Try again in ${humanReadableDuration(saucenaoTimeout.duration)}.`);
        } else {
            embed.setDescription(`Daily searches exhausted. Try again in ${humanReadableDuration(saucenaoTimeout.duration)}.`);
        }
        return message.reply({ allowedMentions: { repliedUser: false }, embeds: [embed] });
    }

    if (options.manually_invoked) {
        // check if urls are seperated by newline instead of whitespace/tab
        // and also store the result (we only care about the first url for now)
        // TODO: just drop links in case of image dump

        // TODO: consider moving these checks to sauce.js
        if (options.args.length) {
            // store urls in a set to avoid dupes
            urls = Array.from(new Set(options.args[0].split("\n")));
            imgurl = urls[0]; // again, we are only allowing one url for now
        }
        else {
            try {
                imgurl = message.attachments.first().url;
                attachment = true;
            }
            catch (err) { }
        }
    }
    else {
        // TODO: cleanup (and maybe rewrite) this block
        // TODO: ignore if there is leading text

        // currently only allows one image per message
        // https://urlregex.com/
        const url_regex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;

        // the order of these checks work out here
        // check if message has spoiler tags
        const spoiler_regex = new RegExp("\\|\\|" + url_regex.source + "\\|\\|");
        let urls = message.content.match(spoiler_regex);
        if (!urls) { urls = message.content.match(url_regex); }
        else { spoiler = true; }

        if (urls) {
            if (spoiler) {
                // extract url from spoiler'd message
                imgurl = message.content.match(url_regex)[0];
            }
            else { imgurl = urls[0]; }

            // check if query contains more than one url
            //const urls_input = Array.from(new Set(urls.input.split("\n")));
        }
        else {
            // looks like discord only allows one attachment per message if
            // sent by a normal user
            try {
                imgurl = message.attachments.first().url;
                if (message.attachments.first().spoiler) {
                    spoiler = true;
                }
                attachment = true;
            }
            catch (err) { return; } // no images found; nothing to do
        }

        // check if url is surrounded by angle brackets
        /*const noembed_regex = new RegExp("\\<" + url_regex.source + "\\>");
        urls = message.content.match(noembed_regex);
        */

    }


    if (domain_exclusions.includes(parse(imgurl, true).hostname) && !options.manually_invoked) {
        logger.notice(`URL ${imgurl} excluded from search`);
        return;
    }

    // save SauceNAO some trouble and check if image URL actually leads to an image
    // TODO: for attachments, discord.js has a built-in check for this
    try {
        const stream = _stream(imgurl);
        const mimetype = await fromStream(stream);

        const re = /^image\/.+$/; 
        if (!mimetype || !re.test(mimetype.mime)) {
            if (options.manually_invoked) {
                let error_msg = "That URL does not lead to an image.";
                if (attachment) { error_msg = "That attachment is not an image."; }

                return message.reply({ content: error_msg });
            }
            return;
        }
    }

    // see: https://github.com/sindresorhus/got/blob/HEAD/documentation/8-errors.md
    // instanceof doesn't seem to work on got's errors for some reason
    catch (error) {
        if (error instanceof TypeError) {
            logger.error(error.message);
            if (options.manually_invoked) {
                return message.reply({ content: "That is not a valid URL." });
            }
            return;
        }
        if (error.name && error.name === "RequestError"){
            // we're only checking these for now
            switch (error.code) {
                case "ERR_INVALID_URL":
                    logger.error(error.message);
                    if (options.manually_invoked) {
                        return message.reply({ content: "That is not a valid URL." });
                    }
                    break;
                case "ECONNREFUSED":
                    logger.error(error.message);
                    if (options.manually_invoked) {
                        return message.reply({ content: "Server refused the connection." });
                    }
                    break;
                case "ETIMEDOUT":
                    logger.error(error.message);
                    if (options.manually_invoked) {
                        return message.reply({ content: "Connection timed out." });
                    }
                    break;
                default:
                    logger.error(error);
                    if (options.manually_invoked) {
                        return message.reply({ content: "An unknown error occurred." });
                    }
            }
            return;
        }
        if (error.name && error.name == "MaxRedirectsError"){
           return logger.error(error.message);
        }
        return logger.error(error);
    }

    // check if channel is NSFW and adjust SauceNAO URL accordingly
    let hidelevel = "3";
    if (message.channel.nsfw) { hidelevel = "0"; }
    //const dbmask = 0000000;
    const db = "999"; // will likely always be 999
    const output_type = "2";
    const testmode = "0";
    //const numres = 1;

    // minimum similarity
    // should be good enough for now
    //let minsim = "85!";
    const url = `https://saucenao.com/search.php?db=${db}`
        + `&hidelevel=${hidelevel}`
        + `&output_type=${output_type}`
        + `&testmode=${testmode}`
        + `&numres=${options.numres}`
        + `&minsim=${options.minsim}`
        + `&url=${imgurl}`
        + `&api_key=${api_key}`;

    // fallback url in case the server gives a 429 or some other error
    const fallback_url = `https://saucenao.com/search.php?db=${db}`
        + `&hidelevel=${hidelevel}`
        + `&url=${imgurl}`;

    // https://www.twilio.com/blog/2017/08/http-requests-in-node-js.html
    get(url, (resp) => {
        const status_msg = http_status_codes;
        if (resp.statusCode !== 200) {
            if (resp.statusCode === 403) {
                logger.crit("SauceNAO received invalid API key");
                return;
            }
            else {
                const error_msg = `SauceNAO returned **${resp.statusCode} ${status_msg[String(resp.statusCode)]}**`;
                let nsfw_warning = "";
                if (!message.channel.nsfw) { nsfw_warning = "(may or may not be NSFW)"; }
                const embed = new EmbedBuilder();
                embed.setTitle("Search Failed");
                embed.setDescription(error_msg);
                embed.addFields({ name: "Fallback URL", value: `[SauceNAO results page](${fallback_url}) ${nsfw_warning}` });
                const filename_guess = getPixivID(url);
                if (filename_guess) {
                    embed.addFields({ name: "Filename Guess", value: filename_guess });
                }
                logger.warning(error_msg);
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
            try {
                results = JSON.parse(data).results;
            }
            catch (e) {
                // TODO: figure out what exception this should actually catch
                logger.error(e);
            }
            const header = JSON.parse(data).header;

            if (header.long_remaining < 1) {
                // daily searches exhausted; ignore requests for 6 hours
                // 6 hours may not be enough; we may need to reset on HTTP 429
                saucenaoTimeout.duration = Date.now() + 2.17e07;
                saucenaoTimeout.short = false;
            }
            else if (header.short_remaining < 1) {
                // too many searches within 30 seconds; ignore requests for 30 seconds
                saucenaoTimeout.duration = Date.now() + 30000;
                saucenaoTimeout.short = true;
            }

            if (header.status > 0) {
                // we got an error but things might still work
                const log_error_msg = `SauceNAO API returned status ${header.status}.`;
                logger.error(log_error_msg);
                // something definitely went wrong
                if (!results) {
                    const user_error_msg = "SauceNAO API Error. Try again.";
                    if (options.manually_invoked) {
                        return message.reply({ embeds: [new EmbedBuilder().setDescription(user_error_msg)] });
                    }
                    return;
                }
            }
            else if (header.status < 0) {
                if (header.message) {
                    const error_msg = `Search failed with message: \`\`${header.message}\`\``;
                    logger.warning(error_msg);
                    if (options.manually_invoked) {
                        return message.reply({ embeds: [new EmbedBuilder().setDescription(error_msg)] });
                    }
                    return;
                }
                logger.warning("Bad image or other request error. Try a different image or try just again later.");
                return;
            }

            // should never fail with workaround in place, but we'll leave it just in case
            if (!results) {
                const error_msg = "SauceNAO reported successful search but returned no results.";
                logger.error(error_msg);
                if (options.manually_invoked) {
                    return message.reply({ embeds: [new EmbedBuilder().setDescription(error_msg)] });
                }
                return;
            }

            const embeds = constructSauceDispenser(results, indexes, options.minsim, options.manually_invoked);

            // only show 3 results on explicit call, 1 on automatic call
            // TODO: figure out how to hide embeds behind spoiler
            if (embeds.length && !options.manually_invoked) {
                return message.reply({ allowedMentions: { repliedUser: false }, embeds: [embeds[0]] });
            }

            if (!embeds.length) {
                if (options.manually_invoked) {
                    return message.reply({ content: "No suitable matches found for this image." });
                }
                return;
            }
            else if (embeds.length <= 3) {
                message.reply({ embeds: embeds });
            }
            else {
                message.reply({ embeds: embeds.slice(0, 3) });
            }

            /*if (msg){
                message.reply({ content: msg });
            }*/
        });

    }).on("error", (err) => {
        logger.error(err.message);
    });
}

export default getSauce;
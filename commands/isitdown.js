"use strict";

//TODO: lazily wait on https://downforeveryoneorjustme.com/services/api

//const request = require('request');
const https = require('https');
const http_status_codes = require('../resources/http_status_codes.json');

module.exports = {
    name: 'isitdown',
    aliases: [],
    description: 'Check if website is down',
    guildOnly: false,
    args: true,
    usage: '<url>',
    spammy: false,
    permissions: [],

    execute(message, args, bot){
        // maybe there's a more proper way to check for the TypeError?
        const status_msg = http_status_codes;
        try{
            let url = args[0];
            url = url.toLowerCase();
            if (url.startsWith("https://") === false || !url.startsWith("http://") === false){
                url = "https://" + url;
            }
            https.get(url, response => {
                if(response.statusCode === 200 || response.statusCode === 201 || response.statusCode === 202){
                    return message.channel.send('', {embed:{description: `${url} is **UP**`}});
                }

                if(response.statusCode === 521){ // only meaningful for cloudflare
                    return message.channel.send('', {embed:{description: `${url} is **DOWN**`}});
                }

                return message.channel.send('', {embed:{description: `Server returned **${response.statusCode} ${status_msg[String(response.statusCode)]}**`}});

            }).on('error', (error) => {
                if (error.errno === "ENOTFOUND" || error.errno === -3008){
                    return message.reply('', {embed:{description: `Host **${error.hostname}** not found`}});
                }
                message.reply('', {embed:{description: `Something went wrong!`}});
                bot.logger.error(error);
            });
        }
        catch(error){
            if (error instanceof TypeError && error.code === "ERR_INVALID_URL"){
                return message.reply('', {embed:{description: `${error.message}`}});
            }

            throw(error);
        }
    }
}

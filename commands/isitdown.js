"use strict";

//TODO: lazily wait on https://downforeveryoneorjustme.com/services/api
//TODO: use got instead of follow-redirects since we are already using it anyway

//const request = require('request');
//const https = require('https');
import https from 'follow-redirects';
const _https = https.https;

import http_status_codes from '../resources/http_status_codes.js';
import { EmbedBuilder } from 'discord.js';

export const name = 'isitdown';
export const aliases = [];
export const description = 'Check if website is down';
export const guildOnly = false;
export const args = true;
export const usage = '<url>';
export const spammy = false;
export const permissions = [];
export function execute(message, args, dm) {
    // maybe there's a more proper way to check for the TypeError?
    const status_msg = http_status_codes;
    const embed = new EmbedBuilder();
    try {
        let url = args[0];
        url = url.toLowerCase();

        // not gonna bother with ftp, etc.
        if (url.startsWith("https://") === false && url.startsWith("http://") === false) {
            url = "https://" + url;
        }

        _https.get(url, response => {
            if ([200, 201, 202].includes(response.statusCode)) {
                embed.setDescription(`${url} is ** UP **`);
                return message.reply({ embeds: [embed] });
            }

            if (response.statusCode === 521) { // only meaningful for cloudflare
                embed.setDescription(`${url} is **DOWN**`);
                return message.reply({ embeds: [embed] });
            }
            embed.setDescription(`Server returned **${response.statusCode} ${status_msg[String(response.statusCode)]}**`);
            return message.reply({ embeds: [embed] });

        }).on('error', (error) => {
            if (error.errno === "ENOTFOUND" || error.errno === -3008) {
                embed.setDescription(`Host **${error.hostname}** not found`);
                return message.reply({ embeds: [embed] });
            }
            embed.setDescription(`Something went wrong!`);
            dm.logger.error(error);
            return message.reply({ embeds: [embed] }); 
        });
    }
    catch (error) {
        if (error instanceof TypeError && error.code === "ERR_INVALID_URL") {
            embed.setDescription(error.message);
            return message.reply({ embeds: [embed] });
        }
        // TODO: handle automatically instead of having the user deal with it
        if (error.code === "ERR_ASSERTION" && error.message === "protocol mismatch"){
            embed.setDescription("Protocol mismatch. Make sure you chose between `http://` or `https://` correctly")
            return message.reply({ embeds: [embed] });
        }
        throw (error);
    }
}

export default { name, aliases, description, guildOnly, args, usage, spammy, permissions, execute };
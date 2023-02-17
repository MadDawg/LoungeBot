"use strict";

//TODO: lazily wait on https://downforeveryoneorjustme.com/services/api

//const request = require('request');
//const https = require('https');
import { https } from 'follow-redirects';
import http_status_codes from '../resources/http_status_codes.json';
import { MessageEmbed } from 'discord.js';

export const name = 'isitdown';
export const aliases = [];
export const description = 'Check if website is down';
export const guildOnly = false;
export const args = true;
export const usage = '<url>';
export const spammy = false;
export const permissions = [];
export function execute(message, args, bot) {
    // maybe there's a more proper way to check for the TypeError?
    const status_msg = http_status_codes;
    const embed = new MessageEmbed();
    try {
        let url = args[0];
        url = url.toLowerCase();

        if (url.startsWith("https://") === false || !url.startsWith("http://") === false) {
            url = "https://" + url;
        }

        https.get(url, response => {
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
            return message.reply({ embeds: [embed] });
            bot.logger.error(error);
        });
    }
    catch (error) {
        if (error instanceof TypeError && error.code === "ERR_INVALID_URL") {
            embed.setDescription(error.message);
            return message.reply({ embeds: [embed] });
        }

        throw (error);
    }
}

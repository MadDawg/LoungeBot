"use strict";

import { readFileSync } from 'fs';
import { EmbedBuilder } from 'discord.js';

// TODO: check users
// TODO: check for role input

export const name = 'fbi';
export const aliases = ['police', 'hellopolice', 'arrest'];
export const description = 'FBI! Open up! (shows random FBI/police image)';
export const guildOnly = true;
export const args = false;
export const usage = '[user...]';
export const spammy = false;
export const permissions = [];
export function random_int(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
export function execute(message, args, dm) {
    let msg = "";
    args = Array.from(new Set(args)); // remove dupes

    if (args.length === 1) {
        msg = `${args[0]} is under arrest!`;
    }
    else if (args.length === 2) {
        msg = `${args[0]} and ${args[1]} have been arrested!`;
    }
    else if (args.length > 2) {
        for (let i = 0; i < args.length - 1; i++) {
            msg += `${args[i]}, `;
        }
        msg += `and ${args[args.length - 1]} have been arrested!`;
    }

    const raw = JSON.parse(readFileSync('./resources/fbi.json', 'utf8'));
    const links = raw.links;
    const quotes = raw.quotes;
    const links_max = links.length;
    const quotes_max = quotes.length;
    const embed = new EmbedBuilder();
    if (msg != "") {
        embed.setDescription(msg);
    }
    else {
        embed.setDescription(quotes[random_int(quotes_max)]);
    }
    embed.setImage(links[random_int(links_max)]);
    embed.setColor("#FF0000");

    message.channel.send({ embeds: [embed] });
}

export default { name, aliases, description, guildOnly, args, usage, spammy, permissions, execute };
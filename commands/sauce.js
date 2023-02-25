"use strict";

import getSauce from '../lib/saucefunctions.js';

export const name = 'sauce';
export const aliases = ['source'];
export const description = 'Search SauceNAO for image source';
export const guildOnly = false;
export const args = false;
export const usage = '<image URL>';
export const spammy = true;
export const permissions = [];
export async function execute(message, args, dm) {
    if (!args.length && !message.attachments.first()) {
        let reply = `No arguments provided!`
            + `\nUsage: \`${await dm.getPrefix(message.guild.id)}${name} ${usage}\``
            + ` or \`${await dm.getPrefix(message.guild.id)}${name} <image attachment>\``;
        return message.reply({ content: reply });
    }

    getSauce(message, {
        args: args,
        manually_invoked: true,
        numres: "8",
        minsim: "65!"
    });
}

export default { name, aliases, description, guildOnly, args, usage, spammy, permissions, execute };
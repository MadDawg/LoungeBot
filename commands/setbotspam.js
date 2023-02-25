"use strict";

import { PermissionsBitField } from 'discord.js';

export const name = 'setbotspam';
export const aliases = ['setbs', 'addbotspam', 'addbs'];
export const description = 'Mark channel(s) as bot-spam';
export const guildOnly = true;
export const args = false;
export const usage = '[channel...]';
export const spammy = false;
export const permissions = [PermissionsBitField.Flags.ManageChannels];
export async function execute(message, args, dm) {
    const channels = [];
    const regex = /(<#)?(\d+)(>)?/;
    if (args && args.length) {
        args = Array.from(new Set(args));
        for (let i = 0; i < args.length; i++) {
            const arg = args[i].match(regex)[2];
            const channel = message.guild.channels.resolve(arg);
            if (channel) { channels.push(channel); }
            else { /**/ }
        }
    }
    if (channels.length) {
        message.reply({ content: await dm.addBotSpam(channels, message.guild.id) });
    }
    else if (!args.length) {
        message.reply({ content: await dm.addBotSpam([message.channel], message.guild.id) });
    }
    else {
        message.reply({ content: `Channel not found.` });
    }
}

export default { name, aliases, description, guildOnly, args, usage, spammy, permissions, execute };
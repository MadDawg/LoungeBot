"use strict";

import { Permissions } from 'discord.js';

export const name = 'setautosauce';
export const aliases = ['setas', 'addas', 'addautosauce', 'addautosource', 'setautosource'];
export const description = 'Mark channel(s) for automatic image source aquisition';
export const guildOnly = true;
export const args = false;
export const usage = '[channel...]';
export const spammy = false;
export const permissions = [Permissions.FLAGS.MANAGE_CHANNELS];
export async function execute(message, args, bot) {
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
        message.reply({ content: await bot.addAutoSauce(channels, message.guild.id) });
    }
    else if (!args.length) {
        message.reply({ content: await bot.addAutoSauce([message.channel], message.guild.id) });
    }
    else {
        message.reply({ content: `Channel not found.` });
    }
}

"use strict";

import { list_channels } from '../lib/channel_marker.js';

export const name = 'listautosauce';
export const aliases = ['lsas', 'lsautosauce', 'lsautosource'];
export const description = 'List channels marked for auto-sauce';
export const guildOnly = true;
export const args = false;
export const usage = '';
export const spammy = false;
export const permissions = [];
export async function execute(message, args, bot) {
    const autosauce = await bot.getAutoSauce(message.guild.id);
    if (!autosauce || !autosauce.length) { return message.reply({ content: "No channels are marked for auto-sauce." }); }
    list_channels(message, autosauce, "Auto-sauce Channels");
}

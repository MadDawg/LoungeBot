"use strict";

import lister from '../lib/channel_marker.js';
const list_channels = lister.list_channels;

export const name = 'listbotspam';
export const aliases = ['lsbs', 'lsbotspam'];
export const description = 'List channels marked as bot-spam';
export const guildOnly = true;
export const args = false;
export const usage = '';
export const spammy = false;
export const permissions = [];
export async function execute(message, args, dm) {
    const botspam = await dm.getBotSpam(message.guild.id);
    if (!botspam || !botspam.length) { return message.reply({ content: "No channels are marked as bot-spam." }); }
    list_channels(message, botspam, "Bot-spam Channels");
}

export default { name, aliases, description, guildOnly, args, usage, spammy, permissions, execute };
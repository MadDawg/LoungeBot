"use strict";

import lister from '../lib/channel_marker.js';
const list_channels = lister.list_channels;

export const name = 'listautosauce';
export const aliases = ['lsas', 'lsautosauce', 'lsautosource'];
export const description = 'List channels marked for auto-sauce';
export const guildOnly = true;
export const args = false;
export const usage = '';
export const spammy = false;
export const permissions = [];
export async function execute(message, args, dm) {
    const autosauce = await dm.getAutoSauce(message.guild.id);
    if (!autosauce || !autosauce.length) { return message.reply({ content: "No channels are marked for auto-sauce." }); }
    list_channels(message, autosauce, "Auto-sauce Channels");
}

export default { name, aliases, description, guildOnly, args, usage, spammy, permissions, execute };
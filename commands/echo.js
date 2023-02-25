"use strict";

import { EmbedBuilder } from 'discord.js';

//TODO: implement soft character limit

export const name = 'echo';
export const aliases = ['print'];
export const description = 'Repeat entered text';
export const guildOnly = false;
export const args = true;
export const usage = '<text>';
export const spammy = false;
export const permissions = [];
export function execute(message, args, dm) {
    const embed = new EmbedBuilder();
    embed.description = args.join(" ");
    message.reply({ embeds: [embed] });
}

export default { name, aliases, description, guildOnly, args, usage, spammy, permissions, execute };
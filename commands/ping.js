"use strict";
// TODO: consider: https://discordjs.guide/popular-topics/faq.html#how-do-i-check-the-bot-s-ping

import { EmbedBuilder } from 'discord.js';

export const name = 'ping';
export const aliases = ['ping'];
export const description = 'Test the bot\'s latency';
export const guildOnly = false;
export const args = false;
export const usage = '';
export const spammy = false;
export const permissions = [];
export function execute(message, args, dm) {
    const embed = new EmbedBuilder();
    const pingTime = String(new Date().getTime() - message.createdTimestamp);
    embed.description = `${pingTime} ms`;
    message.reply({ embeds: [embed] });
}

export default { name, aliases, description, guildOnly, args, usage, spammy, permissions, execute };
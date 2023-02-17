"use strict";

import { MessageEmbed } from 'discord.js';

//TODO: implement soft character limit

export const name = 'echo';
export const aliases = ['print'];
export const description = 'Repeat entered text';
export const guildOnly = false;
export const args = true;
export const usage = '<text>';
export const spammy = false;
export const permissions = [];
export function execute(message, args, bot) {
    const embed = new MessageEmbed();
    embed.description = args.join(" ");
    message.reply({ embeds: [embed] });
}

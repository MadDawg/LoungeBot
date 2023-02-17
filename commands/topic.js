"use strict";

import { MessageEmbed } from 'discord.js';

export const name = 'topic';
export const aliases = [];
export const description = 'Show channel topic';
export const guildOnly = true;
export const args = false;
export const spammy = false;
export const permissions = [];
export function execute(message, args, bot) {
    if (message.channel.topic) {
        const embed = new MessageEmbed;
        embed.addField("Channel", message.channel.toString());
        embed.addField("Topic", message.channel.topic);
        message.reply({ embeds: [embed] });
    }
    else {
        message.reply({ content: `Topic for ${message.channel} is not set.` });
    }
}

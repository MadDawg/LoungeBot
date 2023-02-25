"use strict";

import { EmbedBuilder } from 'discord.js';

export const name = 'topic';
export const aliases = [];
export const description = 'Show channel topic';
export const guildOnly = true;
export const args = false;
export const usage = '';
export const spammy = false;
export const permissions = [];
export function execute(message, args, dm) {
    if (message.channel.topic) {
        const embed = new EmbedBuilder;
        embed.addFields({name: "Channel", value: message.channel.toString()});
        embed.addFields({name: "Topic", value: message.channel.topic});
        message.reply({ embeds: [embed] });
    }
    else {
        message.reply({ content: `Topic for ${message.channel} is not set.` });
    }
}

export default { name, aliases, description, guildOnly, args, usage, spammy, permissions, execute };
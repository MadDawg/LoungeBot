"use strict";

import { EmbedBuilder } from 'discord.js';

export const name = `user`;
export const aliases = ['userinfo', 'memberinfo'];
export const description = 'Display user info';
export const guildOnly = true;
export const args = false;
export const usage = '[user]';
export const spammy = false;
export const permissions = [];
export async function execute(message, args, dm) {
    args = Array.from(new Set(args));

    const format = {
        timeZone: "UTC",
        hourCycle: "h24",
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short"
    };

    const embed = new EmbedBuilder();
    let member = undefined;
    const tag_regex = /^\w+\#\d{4}$/;
    const id_regex = /^\d+$/;

    if (!args.length) {
        member = message.member;
    }

    // if mention
    else if (message.mentions && message.mentions.members.array().length) {
        member = message.mentions.members.first();
    }

    // if tag (works only if typed exactly as displayed (casing))
    else if (tag_regex.test(args[0])) {
        member = message.guild.members.cache.find(member => member.user.tag === args[0]);
        if (!member) { // BROKEN
            member = await message.guild.members.fetch({ query: args[0], limit: 1 })[0];
        }
    }

    // if id
    else if (id_regex.test(args[0])) {
        member = message.guild.member(args[0]);
    }

    // if username or anything else (BROKEN)
    else {
        member = await message.guild.members.fetch({ query: args.join(' '), limit: 1 })[0];
    }

    if (member) {
        embed.setTitle(`User Info for ${member.user.tag}`);
        embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }));
        embed.addFields({name: "ID", value: member.id});
        embed.addFields({name: "Tag", value: member.user.tag});
        if (member.nickname) {
            embed.addFields({name: "Nickname", value: member.nickname});
        }
        embed.addFields({name: "Account Creation Date", value: new Date(member.user.createdTimestamp).toLocaleString('en-GB', format)});
        embed.addFields({name: "Join Date", value: new Date(member.joinedTimestamp).toLocaleString('en-GB', format)});

        message.channel.send({ embeds: [embed] });
    }
    else {
        message.reply({ content: `user not found or input was invalid.` });
    }
}

export default { name, aliases, description, guildOnly, args, usage, spammy, permissions, execute };
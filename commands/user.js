"use strict";

const Discord = require('discord.js');

module.exports = {
    name: `user`,
    aliases: ['userinfo', 'memberinfo'],
    description: 'Display user info',
    guildOnly: true,
    args: false,
    usage: '[user]',
    spammy: false,
    permissions: [],

    async execute(message, args, bot){
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

        const embed = new Discord.MessageEmbed();
        let member = undefined;
        const tag_regex = /^\w+\#\d{4}$/;
        const id_regex = /^\d+$/;

        if (!args.length){
            member = message.member;
        }
        // if mention
        else if (message.mentions && message.mentions.members.array().length){
            member = message.mentions.members.first();
        }
        // if tag (works only if typed exactly as displayed (casing))
        else if (tag_regex.test(args[0])){
            member = message.guild.members.cache.find(member => member.user.tag === args[0]);
            if(!member){ // BROKEN
                member = await message.guild.members.fetch({query: args[0], limit: 1})[0];
            }
        }
        // if id
        else if (id_regex.test(args[0])){
            member = message.guild.member(args[0]);
        }
        // if username or anything else (BROKEN)
        else{
            member = await message.guild.members.fetch({query: args.join(' '), limit: 1})[0];
        }

        if (member){
            embed.setTitle(`User Info for ${member.user.tag}`);
            embed.setThumbnail(member.user.displayAvatarURL({dynamic:true}));
            embed.addField("ID", member.id);
            embed.addField("Tag", member.user.tag);
            if (member.nickname){
                embed.addField("Nickname", member.nickname);
            }
            embed.addField("Account Creation Date", new Date(member.user.createdTimestamp).toLocaleString('en-GB', format));
            embed.addField("Join Date", new Date(member.joinedTimestamp).toLocaleString('en-GB', format));

            message.channel.send(embed);
        }
        else{ message.reply(`user not found or input was invalid.`); }
    },
  }

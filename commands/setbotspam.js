"use strict";

const { Permissions } = require('discord.js');

module.exports = {
    name: 'setbotspam',
    aliases: ['setbs', 'addbotspam', 'addbs'],
    description: 'Mark channel(s) as bot-spam',
    guildOnly: true,
    args: false,
    usage: '[channel...]',
    spammy: false,
    permissions: [Permissions.FLAGS.MANAGE_CHANNELS],

    async execute(message, args, bot){
        const channels = [];
        const regex = /(<#)?(\d+)(>)?/;
        if (args && args.length){
            args = Array.from(new Set(args));
            for (let i = 0; i < args.length; i++){
                const arg = args[i].match(regex)[2];
                const channel = message.guild.channels.resolve(arg);
                if (channel){ channels.push(channel); }
                else{ /**/ }
            }
        }
        if (channels.length){
            message.reply({ content:  await bot.addBotSpam(channels, message.guild.id) });
        }
        else if (!args.length){
            message.reply({ content: await bot.addBotSpam([message.channel], message.guild.id) });
        }
        else{
            message.reply({ content: `Channel not found.` });
        }
    },
};

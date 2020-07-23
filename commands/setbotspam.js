"use strict";
module.exports = {
    name: 'setbotspam',
    aliases: ['setbs', 'addbotspam', 'addbs'],
    description: 'Mark channel(s) as bot-spam',
    guildOnly: true,
    args: false,
    usage: '[channel...]',
    spammy: false,
    permissions: ['MANAGE_CHANNELS'],

    execute(message, args, bot){
        const channels = [];
        const regex = /(<#)?(\d+)(>)?/;
        if (args && args.length){
            args = Array.from(new Set(args));
            for (let i = 0; i < args.length; i++){
                const arg = args[i].match(regex)[2];
                const channel = message.guild.channels.resolve(arg);
                if (channel){ channels.push(channel); }
                else{ /**/ }
            };
        }
        if (channels.length){
            message.channel.send(bot.addBotSpam(channels, message.guild.id));
        }
        else if (!args.length){
            message.channel.send(bot.addBotSpam([message.channel], message.guild.id));
        }
        else{
            message.channel.send(`Channel not found.`);
        }
    },
};

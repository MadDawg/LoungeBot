"use strict";
module.exports = {
    name: 'removeautosauce',
    aliases: ['rmas','rmautosauce','rmautosource','removeautosource'],
    description: 'Unmark channel for auto-sauce',
    guildOnly: true,
    args: false,
    usage: '[channel] [... [channelN]]',
    spammy: false,
    admin: true,

    execute(message, args, bot){
        //message.channel.send(bot.removeAutoSauce(message.channel.id, message.guild.id));
        const channels = [];
        const regex = /(<#)?(\d+)(>)?/;
        if (args && args.length){
            for (let i = 0; i < args.length; i++){
                const arg = args[i].match(regex)[2];
                const channel = message.guild.channels.resolve(arg);
                if (channel){ channels.push(channel); }
                else{ /**/ }
            };
        }
        if (channels.length){
            message.channel.send(bot.removeAutoSauce(channels, message.guild.id));
        }
        else if (!args.length){
            message.channel.send(bot.removeAutoSauce([message.channel], message.guild.id));
        }
        else{
            message.channel.send(`Channel not found.`);
        }
    },
};

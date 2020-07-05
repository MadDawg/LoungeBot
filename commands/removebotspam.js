"use strict";
module.exports = {
    name: 'removebotspam',
    aliases: ['rmbs','rmbotspam'],
    description: 'Unmark channel as bot-spam',
    guildOnly: true,
    args: false,
    usage: '',
    spammy: false,
    admin: true,

    execute(message, args, bot){
        message.channel.send(bot.removeBotSpam(message.channel.id, message.guild.id));
    },
};

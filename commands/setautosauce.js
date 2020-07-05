"use strict";
module.exports = {
    name: 'setautosauce',
    aliases: ['setas','addbs','addautosauce','addautosource','setautosource'],
    description: 'Mark channel for automatic image source aquisition',
    guildOnly: true,
    args: false,
    //usage:,
    spammy: false,
    admin: true,

    execute(message, args, bot){
        message.channel.send(bot.addAutoSauce(message.channel.id, message.guild.id));
    },
  }

"use strict";

const Discord = require('discord.js');

module.exports = {
    name: 'topic',
    aliases: [],
    description: 'Show channel topic',
    guildOnly: true,
    args: false,
    //usage:,
    spammy: false,
    admin: false,

    execute(message, args, bot){
        if (message.channel.topic){
            const embed = new Discord.MessageEmbed;
            embed.addField("Channel", message.channel);
            embed.addField("Topic", message.channel.topic);
            message.channel.send(embed);
        }
        else{
            message.channel.send(`Topic for ${message.channel} is not set.`);
        }
    },
  }

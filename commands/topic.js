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
    permissions: [],

    execute(message, args, bot){
        if (message.channel.topic){
            const embed = new Discord.MessageEmbed;
            embed.addField("Channel", message.channel.toString());
            embed.addField("Topic", message.channel.topic);
            message.reply({ embeds: [embed] });
        }
        else{
            message.reply({ content: `Topic for ${message.channel} is not set.` });
        }
    },
  }

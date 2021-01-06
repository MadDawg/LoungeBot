"use strict";

const Discord = require('discord.js');

//TODO: implement soft character limit

module.exports = {
    name: 'echo',
    aliases: ['print'],
    description: 'Repeat entered text',
    guildOnly: false,
    args: true,
    usage: '<text>',
    spammy: false,
    permissions: [],

    execute(message, args, bot){
        const embed = new Discord.MessageEmbed();
        embed.description = args.join(" ");
        message.channel.send(embed);
    },
};

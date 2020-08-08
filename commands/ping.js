"use strict";

const Discord = require('discord.js');

module.exports = {
    name: 'ping',
    aliases: ['ping'],
    description: 'Test the bot\'s latency',
    guildOnly: false,
    args: false,
    usage: '',
    spammy: false,
    permissions: [],

    execute(message, args, bot){
        const embed = new Discord.MessageEmbed();
        const pingTime = String(new Date().getTime() - message.createdTimestamp);
        embed.description = `${pingTime} ms`;
        message.channel.send(embed);
    },
};

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
    permissions: ['ADMINISTRATOR'], // too lazy to properly prevent ping abuse...

    execute(message, args, bot){
        // ...though, using embeds should remove most methods
        const embed = new Discord.MessageEmbed();
        embed.description = args.join(" ");
        message.channel.send(embed);
    },
};

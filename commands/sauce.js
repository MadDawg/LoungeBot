//TODO: only parse first image when given an image dump
// and send user a message

const Discord = require('discord.js');

module.exports = {
    name: 'sauce',
    aliases: ['source'],
    description: 'Search SauceNAO for image source',
    guildOnly: false,
    args: true,
    usage: '<image URL>',
    spammy: true,
    admin: false,

    execute(message, args, bot){
        bot.getSauce(message, args, true, 3, "85!");
    },
};

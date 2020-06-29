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
        bot.getSauce(message, 3);
    },
};

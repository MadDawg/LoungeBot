"use strict";

module.exports = {
    name: 'sauce',
    aliases: ['source'],
    description: 'Search SauceNAO for image source',
    guildOnly: false,
    args: true,
    usage: '<image URL>',
    spammy: true,
    permissions: [],

    execute(message, args, bot){
        bot.getSauce(message, args, true, "3", "65!");
    },
};

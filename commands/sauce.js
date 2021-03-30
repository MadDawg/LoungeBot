"use strict";

module.exports = {
    name: 'sauce',
    aliases: ['source'],
    description: 'Search SauceNAO for image source',
    guildOnly: false,
    args: false,
    usage: '<image URL>',
    spammy: true,
    permissions: [],

    execute(message, args, bot){
        bot.getSauce(message, {
            args: args,
            manually_invoked: true,
            numres: "3",
            minsim: "65!"
        });
    },
};

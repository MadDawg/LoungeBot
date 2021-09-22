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

    async execute(message, args, bot){
        if (!args.length && !message.attachments.first()){
            let reply = `No arguments provided!`
            + `\nUsage: \`${await bot.getPrefix(message.guild.id)}${this.name} ${this.usage}\``
            + ` or \`${await bot.getPrefix(message.guild.id)}${this.name} <image attachment>\``;
            return message.reply({ content: reply });
        }

        bot.getSauce(message, {
            args: args,
            manually_invoked: true,
            numres: "8", // we will still only show 3 results
            minsim: "65!"
        });
    },
};

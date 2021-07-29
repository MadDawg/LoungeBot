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
        if (!args.length && !message.attachments.first()){
            let reply = `no arguments provided!`
            + `\nUsage: \`${bot.getPrefix(message.guild.id)}${this.name} ${this.usage}\``
            + ` or \`${bot.getPrefix(message.guild.id)}${this.name} <image attachment>\``;
            return message.reply(reply);
        }

        bot.getSauce(message, {
            args: args,
            manually_invoked: true,
            numres: "8", // we will still only show 3 results
            minsim: "65!"
        });
    },
};

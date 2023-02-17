"use strict";

export const name = 'sauce';
export const aliases = ['source'];
export const description = 'Search SauceNAO for image source';
export const guildOnly = false;
export const args = false;
export const usage = '<image URL>';
export const spammy = true;
export const permissions = [];
export async function execute(message, args, bot) {
    if (!args.length && !message.attachments.first()) {
        let reply = `No arguments provided!`
            + `\nUsage: \`${await bot.getPrefix(message.guild.id)}${this.name} ${this.usage}\``
            + ` or \`${await bot.getPrefix(message.guild.id)}${this.name} <image attachment>\``;
        return message.reply({ content: reply });
    }

    bot.getSauce(message, {
        args: args,
        manually_invoked: true,
        numres: "8",
        minsim: "65!"
    });
}

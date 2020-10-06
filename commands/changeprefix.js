"use strict";
const { command_prefix } = require('../config.json');

module.exports = {
    name: 'changeprefix',
    aliases: ['chpre', 'setprefix'],
    description: 'Change bot\'s command prefix',
    guildOnly: true,
    args: true,
    usage: '<new prefix>',
    spammy: false,
    permissions: ['ADMINISTRATOR'],

    execute(message, args, bot){
        const prefix = bot.getPrefix(command_prefix, message.guild.id);
        if (args[0].length < 2){
            return message.channel.send(`New prefix must be 2 or more characters long. Prefix unchanged.`);
        }
        message.channel.send('', {
            embed: {
                description: `Prefix \`${prefix}\` changed to \`${bot.changePrefix(args[0], prefix, message.guild.id)}\``
            }
        });
    },
};

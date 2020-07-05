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
    admin: true,

    execute(message, args, bot){
        const prefix = bot.initPrefix(command_prefix, message.guild.id);
        message.channel.send(`Prefix **${prefix}** changed to **${bot.changePrefix(args[0], prefix, message.guild.id)}**`);
    },
};

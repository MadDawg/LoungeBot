"use strict";
const { command_prefix } = require('../config/config.json');

module.exports = {
    name: 'changeprefix',
    aliases: ['chpre', 'setprefix'],
    description: 'Change bot\'s command prefix',
    guildOnly: true,
    args: true,
    usage: '<new prefix>',
    spammy: false,
    permissions: ['ADMINISTRATOR'],

    async execute(message, args, bot){
        const prefix = await bot.getPrefix(message.guild.id);
        if (args[0].length < 2){
            return message.channel.send(`New prefix must be 2 or more characters long. Prefix (\`${prefix}\`) unchanged.`);
        }
        const newprefix = await bot.changePrefix(args[0], message.guild.id);
        message.channel.send('', {
            embed: {
                description: `Prefix \`${prefix}\` changed to \`${newprefix}\``
            }
        });
    },
};

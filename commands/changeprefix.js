"use strict";
const { MessageEmbed, Permissions } = require('discord.js');

module.exports = {
    name: 'changeprefix',
    aliases: ['chpre', 'setprefix'],
    description: 'Change bot\'s command prefix',
    guildOnly: true,
    args: true,
    usage: '<new prefix>',
    spammy: false,
    permissions: [Permissions.FLAGS.ADMINISTRATOR],

    async execute(message, args, bot) {
        const prefix = await bot.getPrefix(message.guild.id);
        if (args[0].length < 2) {
            return message.reply({ content: `New prefix must be 2 or more characters long. Prefix (\`${prefix}\`) unchanged.` });
        }
        const newprefix = await bot.changePrefix(args[0], message.guild.id);
        message.channel.send({ embeds: [new MessageEmbed().setDescription(`Prefix \`${prefix}\` changed to \`${newprefix}\``)]});
    },
};

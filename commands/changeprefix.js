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
        message.channel.send(`Prefix **${bot.initPrefix(command_prefix, message.guild.id)}** changed to **${bot.changePrefix(args[0], prefix, message.guild.id)}**`);
    },
};

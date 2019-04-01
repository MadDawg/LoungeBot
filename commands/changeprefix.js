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
        command_prefix = bot.initPrefix(command_prefix, message.guild.id);
        message.channel.send(`Prefix **${command_prefix}** changed to **${bot.changePrefix(args[0], command_prefix, message.guild.id)}**`);
    },
};

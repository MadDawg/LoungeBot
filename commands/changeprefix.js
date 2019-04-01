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
<<<<<<< HEAD
        const prefix = bot.initPrefix(command_prefix, message.guild.id);
        message.channel.send(`Prefix **${prefix}** changed to **${bot.changePrefix(args[0], prefix, message.guild.id)}**`);
=======
        command_prefix = bot.initPrefix(command_prefix, message.guild.id);
        message.channel.send(`Prefix **${command_prefix}** changed to **${bot.changePrefix(args[0], command_prefix, message.guild.id)}**`);
>>>>>>> 5f6dcc48ddc9a709d9f73645668250296e57704e
    },
};

module.exports = {
    name: 'changeprefix',
    aliases: ['chpre'],
    description: 'Change bot\'s command prefix',
    guildOnly: true,
    args: true,
    usage: '<new prefix>',
    spammy: false,
    admin: true,

    execute(message, args){
        message.channel.send(`Prefix **${prefix}** changed to **${bot.changePrefix(args[0], prefix, message.guild.id)}**`);
    },
};

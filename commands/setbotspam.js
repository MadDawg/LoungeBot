module.exports = {
    name: 'setbotspam',
    aliases: ['setbs', 'addbs'],
    description: 'Mark channel as bot-spam',
    guildOnly: true,
    args: false,
    usage: '',
    spammy: false,
    admin: true,

    execute(message, args, bot){
        message.channel.send(bot.addBotSpam(message.channel.id, message.guild.id));
    },
};

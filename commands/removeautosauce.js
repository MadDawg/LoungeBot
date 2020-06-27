module.exports = {
    name: 'removeautosauce',
    aliases: ['rmas','rmautosauce','rmautosource','removeautosource'],
    description: 'Unmark channel for auto-sauce',
    guildOnly: true,
    args: false,
    usage: '',
    spammy: false,
    admin: true,

    execute(message, args, bot){
        message.channel.send(bot.removeAutoSauce(message.channel.id, message.guild.id));
    },
};

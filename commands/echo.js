module.exports = {
    name: 'echo',
    aliases: ['print'],
    description: 'Repeat entered text',
    guildOnly: false,
    args: true,
    usage: '<text>',
    spammy: false,
    admin: false,

    execute(message, args, bot){
        message.channel.send("> "+args.join(" "));
    },
};

module.exports = {
    name: 'listbotspam',
    aliases: ['lsbs','lsbotspam'],
    description: 'List channels marked as bot-spam',
    guildOnly: true,
    args: false,
    usage: '',
    spammy: false,
    admin: false,

    execute(message, args, bot){
        //TODO: format this as embed
        let botspam = bot.getBotSpam(message.guild.id);
        if(botspam == []) return;
        let channels = message.guild.channels;

        //TODO: remove bot-spam channel if it was deleted from the server (bypasses admin check but that's fine)
        for (var i = 0; i < botspam.length; i++){
            let channel = channels.get(botspam[i]);
            if (channel){
                let category = channels.get(channel.parentID);
                message.channel.send(`Channel Name: ${channel.name}\n`+
                    `Channel ID: ${channel.id}\n`+
                    `Parent Category: ${category.name}`);
            }
        }
    },
};

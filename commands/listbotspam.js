"use strict";

const lister = require('../lib/channel_marker.js');

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
        let botspam = bot.getBotSpam(message.guild.id);
        if(!botspam || !botspam.length){ return message.channel.send("No channels are marked as bot-spam."); }
        lister.list_channels(message, botspam);
    },
};

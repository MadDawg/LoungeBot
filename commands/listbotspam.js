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
    permissions: [],

    async execute(message, args, bot){
        const botspam = await bot.getBotSpam(message.guild.id);
        if (!botspam || !botspam.length) { return message.reply({ content: "No channels are marked as bot-spam." }); }
        lister.list_channels(message, botspam, "Bot-spam Channels");
    },
};

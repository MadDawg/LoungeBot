"use strict";

const lister = require('../lib/channel_marker.js');

module.exports = {
    name: 'listautosauce',
    aliases: ['lsas','lsautosauce','lsautosource'],
    description: 'List channels marked for auto-sauce',
    guildOnly: true,
    args: false,
    usage: '',
    spammy: false,
    permissions: [],

    execute(message, args, bot){
        let autosauce = bot.getAutoSauce(message.guild.id);
        if(!autosauce || !autosauce.length){ return message.channel.send("No channels are marked for auto-sauce."); }
        lister.list_channels(message, autosauce, "Auto-sauce Channels");
    },
};

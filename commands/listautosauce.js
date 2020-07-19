"use strict";

const Discord = require('discord.js');
const lister = require('../lib/channel_marker.js');

module.exports = {
    name: 'listautosauce',
    aliases: ['lsas','lsautosauce','lsautosource'],
    description: 'List channels marked for auto-sauce',
    guildOnly: true,
    args: false,
    usage: '',
    spammy: false,
    admin: false,

    execute(message, args, bot){
        //TODO: format this as embed
        let autosauce = bot.getAutoSauce(message.guild.id);
        if(!autosauce || !autosauce.length){ return message.channel.send("No channels are marked for auto-sauce."); }
        lister.list_channels(message, autosauce);
    },
};

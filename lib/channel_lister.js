"use strict";

// TODO: add page for every 8 "items"
// recall that each item contains 3 fields,
// which each need 2 lines,
// and Discord embeds are limited to 25 fields (which maths out to 24 fields here)

const Discord = require('discord.js');

const lister = {
    list_channels(message, dbchannels){
        if(!dbchannels){ return; }

        let channels = message.guild.channels;
        //TODO: remove channel from database if it was deleted from the server
        const embed = new Discord.MessageEmbed();
        const fields = [];
        for (var i = 0; i < dbchannels.length; i++){
            let channel = channels.resolve(dbchannels[i]);
            if (channel){
                const category = channel.parent;
                fields.push({name:"Channel", value:channel.toString(), inline:true});
                fields.push({name:"Channel ID", value:channel.id, inline:true});
                fields.push({name:"Parent Category", value:category.name, inline:true});
            }
        }
        embed.addFields(fields);
        message.channel.send(embed);
    }
};

module.exports = lister;

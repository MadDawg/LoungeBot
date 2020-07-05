"use strict";
module.exports = {
    name: 'listoffline',
    aliases: ['lsoffline', 'listoff', 'lsoff'],
    description: 'Show offline users',
    guildOnly: true,
    args: false,
    //usage:,
    spammy: false,
    admin: false,

    execute(message, args, bot){
        //console.log(message.guild.members.last().presence.status == "offline");
        offline_members = message.guild.members.filter(member => member.presence.status == "offline").array()
        //console.log(offline_members)
        //offline_members = message.guild.members.filter(member => member.user.serverDeaf == false)
        message.channel.send(`The server has ${offline_members.length} offline users (${message.guild.memberCount} total users).`);
    },
  }

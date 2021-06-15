"use strict";
module.exports = {
    name: 'listoffline',
    aliases: ['lsoffline', 'listoff', 'lsoff'],
    description: 'Show offline users',
    guildOnly: true,
    args: false,
    //usage:,
    spammy: false,
    permissions: [],

    async execute(message, args, bot){
        const members = await message.guild.members.fetch()
        const offline_members = members.filter(member => member.presence.status === "offline").array();
        message.channel.send(`The server has ${offline_members.length} offline users (${message.guild.memberCount} total users).`);
    },
  }

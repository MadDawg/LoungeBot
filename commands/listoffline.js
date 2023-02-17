"use strict";
export const name = 'listoffline';
export const aliases = ['lsoffline', 'listoff', 'lsoff'];
export const description = 'Show offline users';
export const guildOnly = true;
export const args = false;
export const spammy = false;
export const disabled = true;
export const permissions = [];
export async function execute(message, args, bot) {
    const members = await message.guild.members.fetch();
    const offline_members = members.filter(member => member.presence.status === "offline").array();
    message.reply({ content: `The server has ${offline_members.length} offline users (${message.guild.memberCount} total users).` });
}

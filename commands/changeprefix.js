"use strict";
import Discord from 'discord.js';
const { EmbedBuilder, PermissionsBitField } = Discord;

export const name = 'changeprefix';
export const aliases = ['chpre', 'setprefix'];
export const description = 'Change bot\'s command prefix';
export const guildOnly = true;
export const args = true;
export const usage = '<new prefix>';
export const spammy = false;
export const permissions = [PermissionsBitField.Flags.Administrator];
export async function execute(message, args, dm) {
    const prefix = await dm.getPrefix(message.guild.id);
    if (args[0].length < 2) {
        return message.reply({ content: `New prefix must be 2 or more characters long. Prefix (\`${prefix}\`) unchanged.` });
    }
    const newprefix = await dm.changePrefix(args[0], message.guild.id);
    message.channel.send({ embeds: [new EmbedBuilder().setDescription(`Prefix \`${prefix}\` changed to \`${newprefix}\``)] });
}

export default { name, aliases, description, guildOnly, args, usage, spammy, permissions, execute };
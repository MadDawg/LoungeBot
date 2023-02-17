"use strict";
import { MessageEmbed, Permissions } from 'discord.js';

export const name = 'changeprefix';
export const aliases = ['chpre', 'setprefix'];
export const description = 'Change bot\'s command prefix';
export const guildOnly = true;
export const args = true;
export const usage = '<new prefix>';
export const spammy = false;
export const permissions = [Permissions.FLAGS.ADMINISTRATOR];
export async function execute(message, args, bot) {
    const prefix = await bot.getPrefix(message.guild.id);
    if (args[0].length < 2) {
        return message.reply({ content: `New prefix must be 2 or more characters long. Prefix (\`${prefix}\`) unchanged.` });
    }
    const newprefix = await bot.changePrefix(args[0], message.guild.id);
    message.channel.send({ embeds: [new MessageEmbed().setDescription(`Prefix \`${prefix}\` changed to \`${newprefix}\``)] });
}

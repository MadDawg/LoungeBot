"use strict";
const Discord = require('discord.js');
const { command_prefix } = require('../config.json');

module.exports = {
    name: 'help',
    aliases: ['commands'],
    description: 'List all commands or info about a specific command',
    guildOnly: false,
    args: false,
    spammy: false,
    permissions: [],

    execute(message, args, bot){
        const data = [];
        const { commands } = message.client;
        const embed = new Discord.MessageEmbed();

        if (!args.length) {
            embed.addField("Available commands", commands.map(command => command.name).join(', '));
            embed.setDescription(
                `\nYou can send \`${command_prefix}help <command name>\` to get info on a specific command!` +
                `\nVisit https://github.com/MadDawg/LoungeBot/blob/master/COMMANDS.md for additional information.`
            );

            return message.author.send(embed)
                .then(() => {
                    if (message.channel.type === 'dm') return;
                    message.reply('I\'ve sent you a DM with all commands!');
                })
                .catch(error => {
                    bot.logger.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    message.reply('failed to send DM. Do you have DMs disabled?');
                });
        }
        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.reply('that\'s not a valid command!');
        }

        data.push({name:`Command`, value:`${command.name}`});

        if (command.aliases && command.aliases.length) data.push({name:`Aliases`, value:`${command.aliases.join(', ')}`});
        if (command.description) data.push({name:`Description`, value:`${command.description}`});
        if (command.usage){
            data.push({name:`Usage`, value:`${command_prefix}${command.name} ${command.usage}\n` +
                `*reminder: <arg> = required, [arg] = optional*`});
        }
        if (command.spammy) data.push({name:`Spammy`, value:`Can only be used in channels marked as bot-spam`});
        if (command.permissions && command.permissions.length) data.push({name:`Required Permissions`, value:`${command.permissions.join(', ')}`});

        embed.addFields(data);

        message.channel.send(embed);
    },
};

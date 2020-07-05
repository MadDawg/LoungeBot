"use strict";
const { command_prefix } = require('../config.json');

// TODO: use embeds 

module.exports = {
    name: 'help',
    aliases: ['commands'],
    description: 'List all commands or info about a specific command',
    guildOnly: false,
    args: false,
    spammy: false,
    admin: false,

    execute(message, args, bot){
        const data = [];
        const { commands } = message.client;

        if (!args.length) {
            data.push('Here\'s a list of all commands:');
            data.push(commands.map(command => command.name).join(', '));
            data.push(`\nYou can send \`${command_prefix}help <command name>\` to get info on a specific command!`);
            data.push(`\nVisit https://github.com/MadDawg/LoungeBot/blob/master/COMMANDS.md for additional information.`)

            return message.author.send(data, { split: true })
                .then(() => {
                    if (message.channel.type === 'dm') return;
                    message.reply('I\'ve sent you a DM with all commands!');
                })
                .catch(error => {
                    console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    message.reply('failed to send DM. Do you have DMs disabled?');
                });
        }
        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.reply('that\'s not a valid command!');
        }

        data.push(`**Name:** ${command.name}`);

        if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
        if (command.description) data.push(`**Description:** ${command.description}`);
        if (command.usage) data.push(`**Usage:** ${command_prefix}${command.name} ${command.usage}`);
        if (command.spammy) data.push(`*Can only be used in channels marked as bot-spam*`);
        if (command.admin) data.push(`*Requires **ADMINISTRATOR** server permission*`);

        //data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

        message.channel.send(data, { split: true });

    },
};

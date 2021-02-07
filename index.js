"use strict";

// Node.js stuff
const fs = require('fs');

// Discord stuff
const {token, command_prefix} = require('./config.json');
const Discord = require('discord.js');
const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// Other third-party stuff
//const Cron = require('node-cron');

// Our stuff
const LoungeBot = require('./lib/loungebot.js');
const bot = new LoungeBot();
const logger = bot.logger;

function goodbye(){
    logger.info("Logging off!");
    client.destroy();
}

function badbye(error){
    logger.crit(error);
    goodbye();
}

process.on('SIGINT', goodbye);
process.on('SIGTERM', goodbye);
process.on('uncaughtException', badbye);
process.on('unhandledRejection', badbye);

client.on('ready', () => {
    // we'll forgive the usage of console.log here
    console.log("    __                                 ____        __ \n"
        + "   \/ \/   ____  __  ______  ____ ____  \/ __ )____  \/ \/_\n"
        + "  \/ \/   \/ __ \\\/ \/ \/ \/ __ \\\/ __ `\/ _ \\\/ __  \/ __ \\\/ __\/\n"
        + " \/ \/___\/ \/_\/ \/ \/_\/ \/ \/ \/ \/ \/_\/ \/  __\/ \/_\/ \/ \/_\/ \/ \/_  \n"
        + "\/_____\/\\____\/\\__,_\/_\/ \/_\/\\__, \/\\___\/_____\/\\____\/\\__\/  \n"
        + "                        \/____\/        \n"
        + "Enabling your laziness since 2019");

    client.user.setActivity('you all laze about', {type: 'WATCHING'});
});

client.on('message', message => {
    // ignore messages from other bots
    if (message.author.bot) return;

    // check guild id and assign prefix appropriately
    // if guild id is not found in database, use default prefix
    let prefix = command_prefix;
    try{
        prefix = bot.getPrefix(command_prefix, message.guild.id);
    }
    catch(err){}

    // Conveniently, trailing whitespaces are eaten/ignored
    if (message.content === `<@${client.user.id}>` || message.content === `<@!${client.user.id}>`){
        message.channel.send('', {embed: {description: `My command prefix is \`${prefix}\``}})
        return;
    }

    let args = [];

    if (message.content.startsWith(prefix)){
        args = message.content.slice(prefix.length).split(/ +/);
    }
    // allow command execution on mention
    // TODO: maybe use regex?
    else if (message.content.startsWith(`<@${client.user.id}>`)){
        args = message.content.slice((`<@${client.user.id}>`).length).split(/ +/);
    }
    else if (message.content.startsWith(`<@!${client.user.id}>`)){
        args = message.content.slice((`<@!${client.user.id}>`).length).split(/ +/);
    }
    else{
        if (bot.isAutoSauce(message.channel.id, message.guild.id)){
            bot.getSauce(message, {
                args: [],
                manually_invoked: false,
                numres: "2",
                minsim: "65!"
            });
        }
        return;
    }

    if (args[0] === '') args.splice(0,1);

    // avoid breaking when prefix is entered with no command
    if (!args.length){ return; }

    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (command.disabled) return;

    if (command.permissions && command.permissions.length){
        for (let i = 0; i < command.permissions.length; i++){
            const permission = command.permissions[i];
            if (!message.member.permissions.has(permission)){
                return message.reply(`you need the following permissions: ${command.permissions.join(', ')}`);
            }
        }
    }

    if (command.guildOnly && message.channel.type !== 'text') {
        return message.reply('I can\'t execute that command inside DMs!');
    }

    if (command.args && !args.length){
        let reply = `no arguments provided!`;

        if (command.usage) {
            reply += `\nUsage: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.reply(reply);
    }

    if (command.spammy){
        // allow spammy stuff in DM channel
        // TODO: add admin bypass
        if (message.channel.type === 'text' && !bot.isBotSpam(message.channel.id, message.guild.id)){
            return message.reply(`this command can only be executed in channels marked as bot-spam`);
        }
    }

    try {
        command.execute(message, args, bot);
    }
    catch (error) {
        logger.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

client.login(token);

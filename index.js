"use strict";

// Node.js stuff
const fs = require('fs');
//const { spawn } = require('child_process');

// Discord stuff
// TODO: add owner field to config.json
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
//const Browser = require('zombie');
//const browser = new Browser();
//const Cron = require('node-cron');

// Our stuff
const LoungeBot = require('./loungebot.js');
const bot = new LoungeBot();

// gracefully end on keyboard interrupt (NOTE: does not work on Windows!)
process.on('SIGINT', function() {
    console.log("Logging off!");
    client.destroy();
});

client.on('ready', () => {
    console.log('LoungeBot: enabling your laziness since 2019!\nReady!');
    client.user.setActivity('you all laze about', {type: 'WATCHING'});
});

client.on('message', message => { 
    // check guild id and assign prefix appropriately
    // if guild id is not found in database, use default prefix
    let prefix = command_prefix;
    try{
        prefix = bot.initPrefix(command_prefix, message.guild.id);
    }
    catch(err){}
    
    // TODO: allow command execution on mention
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    
    if (!command) return;
    
    if (command.admin && !message.member.permissions.has('ADMINISTRATOR')){
        return message.reply(`You need the **ADMINISTRATOR** server permission to do that!`);
    }

    if (command.guildOnly && message.channel.type !== 'text') {
        return message.reply('I can\'t execute that command inside DMs!');
    }

    if (command.args && !args.length){
        let reply = `Error: no arguments provided!`;

        if (command.usage) {
            reply += `\nUsage: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }
    
    if (command.spammy){
        // TODO: allow spammy stuff in DM channel
        // if (!message.channel.type !== 'text') return;
        if (!bot.isBotSpam(message.channel.id, message.guild.id)){
            return message.reply(`this command can only be executed in channels marked as bot-spam`);
        }
    }

    try {
        command.execute(message, args, bot);
    } 
    catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    } 
});

client.login(token);

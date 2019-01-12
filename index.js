"use strict";

// Third-party stuff
const Discord = require('discord.js');
const client = new Discord.Client();
//const Cron = require('node-cron');


// Our stuff
const {token, command_prefix} = require('./config.json');
const LoungeBot = require('./loungebot.js');
const bot = new LoungeBot();

client.on('ready', () => {
    console.log('Ready!');
});


const aliases_chpre = ["chpre", "change_prefix", "premod"];

client.on('message', message => {
    // check guild id and assign prefix appropriately
    // if guild id is not found in database, use default prefix
    const prefix = bot.InitPrefix(command_prefix, message.guild.id);
    if(message.content.startsWith(`${prefix}echo`)){
        const [command, ...args] = message.content.split(" ");
        message.channel.send( args.join(" "));
    }
    else if(message.content.startsWith(`${prefix}getid`)){
        message.channel.send(message.guild.id);
    }
    // leave this as the last item to check to avoid the loop when it is not needed
    else if(message.content.startsWith(`${prefix}chpre`)){ //maybe use indexOf to find command in list/array of alternatives
        if (message.member.permissions.has('ADMINISTRATOR')){
            let arg = message.content.substring(message.content.indexOf(" ") + 1, message.content.length);
            message.channel.send(`Prefix **${prefix}** changed to **${bot.ChangePrefix(arg, prefix, message.guild.id)}**`);
        }
        else{
            message.channel.send(`You need the **ADMINISTRATOR** server permission to do that.`);
        }
    }
});

client.login(token);

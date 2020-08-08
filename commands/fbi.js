"use strict";

const fs = require('fs');
const Discord = require('discord.js');

// TODO: check users
// TODO: check for role input

module.exports = {
    name: 'fbi',
    aliases: ['police','hellopolice', 'arrest'],
    description: 'FBI! Open up! (shows random FBI/police image)',
    guildOnly: true,
    args: false,
    usage: '[user...]',
    spammy: false,
    permissions: [],

    random_int(max){
        return Math.floor(Math.random()*Math.floor(max));
    },

    execute(message, args, bot){
        let msg = "";
        args = Array.from(new Set(args)); // remove dupes

        if (args.length === 1){
            msg = `${args[0]} is under arrest!`;
        }
        else if (args.length === 2){
            msg = `${args[0]} and ${args[1]} have been arrested!`;
        }
        else if (args.length > 2){
            for (let i=0; i < args.length-1; i++){
                msg += `${args[i]}, `;
            }
            msg += `and ${args[args.length-1]} have been arrested!`;
        }

        const raw = JSON.parse(fs.readFileSync('./resources/fbi.json', 'utf8'));
        const links = raw.links;
        const quotes = raw.quotes;
        const links_max = links.length;
        const quotes_max = quotes.length;
        const embed = new Discord.MessageEmbed();
        if (msg != ""){
            embed.setDescription(msg);
        }
        else{
            embed.setDescription(quotes[this.random_int(quotes_max)]);
        }
        embed.setImage(links[this.random_int(links_max)]);
        embed.setColor("#FF0000");

        message.channel.send(embed);
    },
  }

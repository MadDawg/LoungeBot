"use strict";

// Third-party stuff
const Discord = require('discord.js');
const client = new Discord.Client();
//const Cron = require('node-cron');
const Browser = require('zombie');
const { spawn } = require('child_process');
const browser = new Browser();

// Our stuff
// TODO: add owner field to config.json
const {token, command_prefix} = require('./config.json');
const LoungeBot = require('./loungebot.js');
const bot = new LoungeBot();

const aliases_chpre = ["chpre", "changeprefix"]; //aliases for chpre command
const aliases_sauce = ["sauce", "source"]; //aliases for sauce command
const aliases_echo = ["echo", "print"]; //aliases for echo command
const nsfw = []; //nsfw commands (not including admin commands)
const spammy = [] + aliases_sauce; //spammy commands

const owner_commands = []; //bot owner exclusive commands
const admin_commands = ["setbotspam", "removebotspam"] + aliases_chpre;
//const debug_commands = [] + aliases_echo;

function create_embeds(json){
    //console.log(json);
    // create RichEmbed object here
    // fields are dependent on information give in the JSON string
    const items = JSON.parse(json);
    const embeds = [];
    for (var i = 0; i < items.length; i++){
        const embed = new Discord.RichEmbed();
        embed.setTitle('Result');
        
        const len = items[i].similarity.length;
        const similarity = Number(items[i].similarity.substring(0,len-1));
        
        if (similarity > 69)
            embed.setColor('#00FF00');
        else if (similarity > 49)
            embed.setColor('#FFFF00');
        else
            embed.setColor('#FF0000');


        if (items[i].title != "")
            embed.addField("Title", items[i].title);
        if (items[i].creator != "")
            embed.addField("Creator", items[i].creator);
        
        embed.setURL(items[i].imgurl);
        embed.setThumbnail(items[i].thumbnail);
        embed.addField("Similarity", items[i].similarity);
        embed.setFooter("Sauce provided by SauceNao");

        embeds.push(embed);
    }
    return embeds;
}

// gracefully end on keyboard interrupt (NOTE: does not work on Windows!)
process.on('SIGINT', function() {
    console.log("Logging off!");
    client.destroy();
});

client.on('ready', () => {
    console.log('LoungeBot: enabling your laziness since 2019!\nReady!');
});

client.on('message', message => { 
    // check guild id and assign prefix appropriately
    // if guild id is not found in database, use default prefix
    const prefix = bot.initPrefix(command_prefix, message.guild.id);
    
    // TODO: allow command execution on mention
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    /*let command_string = message.content.slice(prefix.length).split(' ');
    command_string = command_string.shift().toLowerCase();
    const [command, ...args] = command_string.split(" ");
    */
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    //check user permissions
    if (!message.member.permissions.has('ADMINISTRATOR') && admin_commands.includes(command)){
        message.reply(`You need the **ADMINISTRATOR** server permission to do that.`);
        return;
    }

    //check if command is spammy
    if (spammy.includes(command)){
        if (!bot.isBotSpam(message.channel.id, message.guild.id)){
            message.channel.send(`This command can only be executed in channels marked as bot-spam`);
            return;
        }
    }

    if(aliases_echo.includes(command)){
        message.channel.send(args.join(" "));
    }
    //TODO: remove form filling stuff and just use the direct link
    else if(aliases_sauce.includes(command)){
        if (args == []) return;
        // check if channel is NSFW and adjust SauceNao URL accordingly
        let hidelevel = "3";
        if (message.channel.nsfw){ hidelevel = "1"; }
        function go(){
            browser.assert.success();
            browser.assert.text('title', 'Sauce Found?');
            const html = browser.html('div.result');

            // parse html
            const pyprocess = spawn('python3', ["htmlparser.py", html]);

            pyprocess.stdout.on('data', (data) => {
                const json = data.toString();
                    
                // construct and send embeds here!
                // TODO: embed or otherwise format this link too
                message.channel.send(`**Check the SauceNao page directly at** http://saucenao.com/search.php?db=999i&hide=${hidelevel}&url=${args[0]}`)
                const embeds = create_embeds(json);
                if (embeds == []){
                    message.channel.send(`Nothing to see here (reminder: low similarity results are not shown)`);
                    return;
                }
                for (let i = 0; i < embeds.length; i++){
                    message.channel.send(embeds[i]);
                }
            });   
        }
        browser.visit('http://saucenao.com/search.php?db=999&hide='+hidelevel+'&url='+args[0], go.bind(this));
    }
    else if(command == "setbotspam"){
        message.channel.send(bot.addBotSpam(message.channel.id, message.guild.id));
    }
    else if(command == "removebotspam"){
        message.channel.send(bot.removeBotSpam(message.channel.id, message.guild.id));
    }
    else if(command == "listbotspam"){
        //TODO: format this as embed
        let botspam = bot.getBotSpam(message.guild.id);
        if(botspam == []) return;
        let channels = message.guild.channels;

        //TODO: remove bot-spam channel if it was deleted from the server
        for (var i = 0; i < botspam.length; i++){
            let channel = channels.get(botspam[i]);
            if (channel){
                let category = channels.get(channel.parentID);
                message.channel.send(`Channel Name: ${channel.name}\n`+
                    `Channel ID: ${channel.id}\n`+
                    `Parent Category: ${category.name}`);
            }
        }
    } 
    else if (aliases_chpre.includes(command)){
        let arg = message.content.substring(message.content.indexOf(" ") + 1, message.content.length);
        message.channel.send(`Prefix **${prefix}** changed to **${bot.changePrefix(arg, prefix, message.guild.id)}**`);
    }
});

client.login(token);

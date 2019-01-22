"use strict";

// Third-party stuff
const { Discord, RichEmbed } = require('discord.js');
const client = new Discord.Client();
//const Cron = require('node-cron');
const Browser = require('zombie');
const { spawn } = require('child_process');
const browser = new Browser();

// Our stuff
const {token, command_prefix} = require('./config.json');
const LoungeBot = require('./loungebot.js');
const bot = new LoungeBot();

const aliases_chpre = ["chpre", "changeprefix"];
const aliases_sauce = ["sauce"];
const aliases_echo = ["echo", "print"];

const admin_commands = [] + aliases_chpre;
//const debug_commands = [] + aliases_echo;
json = '[{"creator":"zero (ray 0805)","profile":"","title":"","imgurl":"","similarity":"94.89%"}, {"creator":"Utolee Mangart","profile":"http://www.pixiv.net/member.php?id=12135431","title":"漫画 Manga 765P 766P","imgurl":"http://www.pixiv.net/member_illust.php?mode=medium&amp;illust_id=54110600","similarity":"36.10%"}, {"creator":"いがぐり","profile":"http://www.pixiv.net/member.php?id=6254654","title":"狂喜乱舞","imgurl":"http://www.pixiv.net/member_illust.php?mode=medium&amp;illust_id=64635357","similarity":"37.39%"}, {"creator":"","profile":"","title":"Tokiryoujoku vol. 13","imgurl":"","similarity":"35.60%"}, {"creator":"やまい","profile":"http://www.pixiv.net/member.php?id=2017222","title":"お仕事の宣伝です。","imgurl":"http://www.pixiv.net/member_illust.php?mode=medium&amp;illust_id=57482205","similarity":"35.12%"}, {"creator":"","profile":"","title":"Angel","imgurl":"","similarity":"35.11%"}]';


function create_embeds(json){
    // create RichEmbed object here
    // fields are dependent on information give in the JSON string
    const items = JSON.parse(json);
    const embeds = [];
    for (var i = 0; i < items.length; i++){
        const embed = new RichEmbed();
        embed.setTitle('Result');
        
        const len = items[i].similarity.length;
        const similarity = Number(items[i].similarity.substring(0,len-1));
        
        if (similarity > 69)
            embed.setColor('#00FF00');
        else if (similarity > 49)
            embed.setColor('#FFFF00');
        else
            embed.setColor('#FF0000');

        embeds.append(embed);
    }

}

client.on('ready', () => {
    console.log('Ready!');
});

client.on('message', message => { 
    // check guild id and assign prefix appropriately
    // if guild id is not found in database, use default prefix
    const prefix = bot.InitPrefix(command_prefix, message.guild.id);
    
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

    if(aliases_echo.includes(command)){
        message.channel.send(args.join(" "));
    }
    else if(aliases_sauce.includes(command)){
        create_embeds(json);
        return;
        function go(){
            browser.fill('url', args[0]);
	        //browser.fill('url',this._imgurl);

            function pressBtn(){
		        browser.assert.success();
		        browser.assert.text('title', 'Sauce Found?');
		        const html = browser.html('div.result');

                // parse html
                const pyprocess = spawn('python3', ["htmlparser.py", "-a", html]);

                pyprocess.stdout.on('data', (data) => {
                    const json = data.toString();
                    //console.log(json);
                    //message.channel.send(json);
                    // construct and send embeds here!
                    create_embeds(json);
                });
            }   
            browser.pressButton('get sauce', pressBtn.bind(this));
        }
        browser.visit('http://saucenao.com', go.bind(this));
        //message.channel.send(`This has not been implemented yet.`);
    }
    else if(command == "getid"){
        message.channel.send(message.guild.id);
    }
    else if (aliases_chpre.includes(command)){
        let arg = message.content.substring(message.content.indexOf(" ") + 1, message.content.length);
        message.channel.send(`Prefix **${prefix}** changed to **${bot.ChangePrefix(arg, prefix, message.guild.id)}**`);
    }
});

client.login(token);

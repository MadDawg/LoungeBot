const Discord = require('discord.js');
const Browser = require('zombie');
const browser = new Browser();
const { spawn } = require('child_process');

module.exports = {
    name: 'sauce',
    aliases: ['source'],
    description: 'Search SauceNAO for image source',
    guildOnly: false,
    args: true,
    usage: '<image URL>',
    spammy: true,
    admin: false,
    
    create_embeds(json){
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
    },

    execute(message, args, bot){
        // check if channel is NSFW and adjust SauceNao URL accordingly
        let hidelevel = "3";
        if (message.channel.nsfw){ hidelevel = "0"; }
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
                message.channel.send(`**Check the SauceNao page directly at** http://saucenao.com/search.php?db=999&hide=${hidelevel}&url=${args[0]}`)
                const embeds = this.create_embeds(json);
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
    },
};

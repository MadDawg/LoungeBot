"use strict";

//TODO: this file may be deprecated at this point

const Discord = require('discord.js');
const fs = require('fs');
const Browser = require('zombie');
const parse = require('url-parse');
const { spawn } = require('child_process');

// serverdb is the array of objects representing guild IDs
// and their configured command prefixes


class LoungeBot{
    constructor(){
       try{
           // We should probably be using fs for this but eh...
           this._serverdb = require('./serverdb.json');
       }
       catch(err){
           this._serverdb = [];
       }
    }

    //------ DATABASE METHODS ------
    // database contains:
    // - guild IDs
    // - command prefixes
    // - botspam channels
    // - autosauce channels
    // - watchghostping boolean

    // expected string format: [{"guildid":"", "prefix":"", "botspam":[], "autosauce":[], "watchghostpings":""}]

    // write to file
    writeOut(){
        const data = JSON.stringify(this._serverdb);
        const callback = function(){} // kludge(?) to avoid deprecation warning
        try{
            fs.writeFile('./serverdb.json', data, 'utf8', callback);
        }
        catch(err){ console.error(err); }
        return;
    }
    initDB(guildid, prefix="lb!", botspam=[], autosauce=[], watchghostpings="false"){
        this._serverdb.push({"guildid": guildid, "prefix": prefix, "botspam": botspam, "autosauce": autosauce, "watchghostpings":watchghostpings});
    }

    // check if guild exists in database
    checkDB(guildid){
        if (!this._serverdb.find(x => x.guildid === guildid)){ this.initDB(guildid); }
    }

    initPrefix(prefix, guildid){
        try{
            return this._serverdb.find(x => x.guildid === guildid).prefix;
        }
        catch(err){
            return prefix;
        }
    }

    changePrefix(newprefix, oldprefix, guildid){
        // avoid writing to filesystem if prefix doesn't change
        if (newprefix !== oldprefix){
            this.checkDB(guildid);
            this._serverdb.find(x => x.guildid === guildid).prefix = newprefix;
            this.writeOut();
        }
        return newprefix;
    }

    // Add/remove/check/list bot-spam channels
    addBotSpam(channel, guildid){
        this.checkDB(guildid);
        let botspam = this._serverdb.find(x => x.guildid === guildid).botspam;

        if (this.isBotSpam(channel, guildid)){ return "Channel is already marked as bot-spam."; }

        botspam.push(channel);
        this.writeOut();
        return "Channel marked as bot-spam.";
    }

    removeBotSpam(channel, guildid){
        this.checkDB(guildid);

        let botspam = this._serverdb.find(x => x.guildid === guildid).botspam;
        let index = botspam.indexOf(channel);

        if(index > -1){
            botspam.splice(index, 1);
            this.writeOut();
            return "Channel is no longer marked as bot-spam.";
        }
        return "Channel is not marked as bot-spam.";
    }

    // check if channel is marked as bot-spam
    isBotSpam(channel, guildid){
        this.checkDB(guildid);

        let botspam = this._serverdb.find(x => x.guildid === guildid).botspam;
        let index = botspam.indexOf(channel);

        return index > -1;
    }

    // Be careful to not modify the array on accident!
    // get bot-spam channels
    getBotSpam(guildid){
        this.checkDB(guildid);
        return (this._serverdb.find(x => x.guildid === guildid).botspam);
    }

    addAutoSauce(channel, guildid){
        this.checkDB(guildid);
        let autosauce = this._serverdb.find(x => x.guildid === guildid).autosauce;

        if (this.isAutoSauce(channel, guildid)){ return "Channel is already marked for auto-sauce."; }

        autosauce.push(channel);
        this.writeOut();
        return "Channel marked for auto-sauce.";

    }
    removeAutoSauce(channel, guildid){
        this.checkDB(guildid);
        let autosauce = this._serverdb.find(x => x.guildid === guildid).autosauce;
        let index = autosauce.indexOf(channel);

        if(index > -1){
            autosauce.splice(index, 1);
            this.writeOut();
            return "Channel is no longer marked for auto-sauce.";
        }
        return "Channel is not marked autosauce.";
    }
    isAutoSauce(channel, guildid){
        this.checkDB(guildid);
        // TODO: fix redundant find() call when called from addAutoSauce()
        let autosauce = this._serverdb.find(x => x.guildid === guildid).autosauce;
        let index = autosauce.indexOf(channel);

        return index > -1;
    }
    getAutoSauce(guildid){
        this.checkDB(guildid);
        return (this._serverdb.find(x => x.guildid === guildid).autosauce);
    }
    constructSauceDispenser(json){
        const items = JSON.parse(json);
        if (!items.length) return undefined;

        const best_guess = items[0];
        //const embeds = [];

        const len = best_guess.similarity.length;
        const similarity = Number(best_guess.similarity.substring(0,len-1));
        if (similarity < 85){
            return;
        }

        const embed = new Discord.RichEmbed();
        embed.setTitle('Best Guess for This Image');

        if (best_guess.title != "")
            embed.addField("Title", best_guess.title);
        if (best_guess.creator != "")
            embed.addField("Creator", best_guess.creator);

        // should give original string on failure
        embed.setURL(best_guess.imgurl.replace('&amp;', '&'));
        embed.setThumbnail(best_guess.thumbnail.replace('&amp;', '&'));
        embed.addField("Similarity", best_guess.similarity);
        embed.setFooter("Sauce provided by SauceNao");

        return embed;
    }
    getSauce(message){
        // this re expression may get recomplied every invokation?
        // https://urlregex.com/
        const regex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
        // return if there is no url
        //console.log(message.content);
        //console.log(message);
        //console.log(message.attachments);

        const urls = message.content.match(regex);
        let url = "";
        if (urls){
            url = urls[0];
        }
        else{
            try{
                url = message.attachments.first().url;
            }
            catch(err){ return; }
        }
        /*else if (message.attachments){
            try{
                url = message.attachments.first().url;
            }
            catch(err) return;
        }
        else return;*/

        // check if channel is NSFW and adjust SauceNao URL accordingly
        let hidelevel = "3";
        if (message.channel.nsfw){ hidelevel = "0"; }
        const browser = new Browser();
        function go(){
            browser.assert.success();
            browser.assert.text('title', 'Sauce Found?');
            const html = browser.html('div.result');

            // parse html
            const pyprocess = spawn('python3', ["htmlparser.py", html]);

            pyprocess.stdout.on('data', (data) => {
                const json = data.toString();

                // construct and send message here!
                const embed = this.constructSauceDispenser(json);
                if (embed){ message.channel.send(embed); }

            });
        }
        try{
            browser.visit(`http://saucenao.com/search.php?db=999&hide=${hidelevel}&url=${url}`, go.bind(this));
        }
        catch(AsssertionError){
            console.error("SauceNao errored out.");
            return;
        }
    }

    // --------------------------
}

module.exports = LoungeBot;

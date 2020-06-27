"use strict";

//TODO: this file may be deprecated at this point

// serverdb is the array of objects representing guild IDs
// and their configured command prefixes


class LoungeBot{
    constructor(){
       this._fs = require('fs');
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

    // expected string (sample): [{"guildid":"", "prefix":"", "botspam":[], "autosauce":[], "watchghostping":""}]

    // write to file
    writeOut(){
        const data = JSON.stringify(this._serverdb);
        const callback = function(){} // kludge(?) to avoid deprecation warning
        try{
            this._fs.writeFile('./serverdb.json', data, 'utf8', callback);
        }
        catch(err){ console.error(err); }
        return;
    }
    initDB(guildid, prefix="lb!", botspam=[]){
        this._serverdb.push({"guildid": guildid, "prefix": prefix, "botspam": botspam});
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
            if (!this._serverdb.find(x => x.guildid === guildid)){ this.initDB(guildid); }
            this._serverdb.find(x => x.guildid === guildid).prefix = newprefix;
            this.writeOut();
        }
        return newprefix;
    }

    // Add/remove/check/list bot-spam channels
    addBotSpam(channel, guildid){
        if (!this._serverdb.find(x => x.guildid === guildid)){ this.initDB(guildid); }
        let botspam = this._serverdb.find(x => x.guildid === guildid).botspam;

        if (this.isBotSpam(channel, guildid)){ return "Channel is already marked as bot-spam."; }

        botspam.push(channel);
        this.writeOut();
        return "Channel marked as bot-spam.";
    }

    removeBotSpam(channel, guildid){
        if (!this._serverdb.find(x => x.guildid === guildid)){ this.initDB(guildid); }

        let botspam = this._serverdb.find(x => x.guildid === guildid).botspam;
        let index = botspam.indexOf(channel);

        if(index > -1){
            botspam.splice(index, 1);
            this.writeOut();
            return "Channel is no longer marked as bot-spam.";
        }
        return "Channel is not marked as bot-spam.";
    }

    isBotSpam(channel, guildid){
        if (!this._serverdb.find(x => x.guildid === guildid)){ this.initDB(guildid); }

        let botspam = this._serverdb.find(x => x.guildid === guildid).botspam;
        let index = botspam.indexOf(channel);

        return index > -1;
    }

    // Be careful to not modify the array on accident!
    getBotSpam(guildid){
        if (!this._serverdb.find(x => x.guildid === guildid)){ this.initDB(guildid); }
        return (this._serverdb.find(x => x.guildid === guildid).botspam);
    }
    /*addAutoSauce(channel, guildid){}
    removeAutoSauce(channel, guildid){}
    isAutoSauce(channel, guildid){}
    getAutoSauce(guildid){}
    doAutoSauce(message){
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

                // construct and send message here!

            });
        }
        browser.visit('http://saucenao.com/search.php?db=999&hide='+hidelevel+'&url='+args[0], go.bind(this));
    }*/

    // --------------------------
}

module.exports = LoungeBot;

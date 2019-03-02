"use strict";

// serverdb is the array of objects representing guild IDs
// and their configured command prefixes


class LoungeBot{
    constructor(){
       this._fs = require('fs');
       this._serverdb = require('./serverdb.json');
    } 
    
    //------ DATABASE METHODS ------
    // database contains guild IDs, command prefixes, and botspam channels
    // expected string (sample): [{"guildid":"", "prefix":"", "botspam":[]}]
    
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

    // --------------------------
}

module.exports = LoungeBot;

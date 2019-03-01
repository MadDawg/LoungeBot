"use strict";

// serverdb is the array of objects representing guild IDs
// and their configured command prefixes


class LoungeBot{
    constructor(){
       this._fs = require('fs');
       this._serverdb = require('./serverdb.json');
    } 
    
    //------ DATABASE METHODS ------
    // database contains guild IDs, command prefixes, nsfw channels, and botspam channels
    // expected string (sample): [{"guildid":"", "prefix":"", "nsfw":[], "botspam":[]}]
    
    // write to file
    WriteOut(){
        const data = JSON.stringify(this._serverdb);
        const callback = function(){} // kludge(?) to avoid deprecation warning
        try{
            this._fs.writeFile('./serverdb.json', data, 'utf8', callback);
        }
        catch(err){ console.error(err); }
        return;
    }
    InitDB(guildid, prefix="lb!", nsfw=[], botspam=[]){
        this._serverdb.push({"guildid": guildid, "prefix": prefix, "nsfw": nsfw, "botspam": botspam});
    }
    // TODO: remove this and replace with prefix, nsfw, etc. functions
    UpdateDB(prefix, nsfw, botspam, guildid){
        try{
            // this should all work so long as find() succeeds
            if (prefix){
                this._serverdb.find(x => x.guildid === guildid).prefix = prefix;
            }
            if (this._serverdb.find(x => x.guildid === guildid).nsfw && nsfw){
                this._serverdb.find(x => x.guildid === guildid).nsfw.push(nsfw);
            }
            else if(nsfw){
                this._serverdb.find(x => x.guildid === guildid).nsfw = [nsfw];
            }

            if(this._serverdb.find(x => x.guildid === guildid).botspam && botspam){
                this._serverdb.find(x => x.guildid === guildid).botspam.push(botspam);
            }
            else if(botspam){
                this._serverdb.find(x => x.guildid === guildid).botspam = [botspam];
            }
        }
        catch(err){
            InitDB(guildid, prefix, [nsfw], [botspam]);
        }
        this.WriteOut();
    }

    InitPrefix(prefix, guildid){ 
        try{ 
            return this._serverdb.find(x => x.guildid === guildid).prefix;
        }
        catch(err){
            return prefix;
        }
    }

    ChangePrefix(newprefix, oldprefix, guildid){
        // avoid writing to filesystem if prefix doesn't change
        if (newprefix !== oldprefix){
            this.UpdateDb(newprefix, guildid);
        }
        return newprefix;
    }
    
    // TODO: add ability to accept array of channels
    // Add/remove/check nsfw channel
    AddNSFW(channel, guildid){
        if (!this._serverdb.find(x => x.guildid === guildid)){ InitDB(guildid); }
        let nsfw = this._serverdb.find(x.guildid === guildid);
        
        nsfw.push(channel);
        this.WriteOut();
        //return message
    }
    
    RemoveNSFW(channel, guildid){
        if (!this._serverdb.find(x => x.guildid === guildid)){ InitDB(guildid); }
        let nsfw = this._serverdb.find(x.guildid === guildid).nsfw;
        
        let index = nsfw.indexOf(channel);
        
        if(index > -1){
            nsfw.splice(index, 1);
            this.WriteOut();
            //return message
        }
        //return message
    }

    IsNSFW(channel, guildid){
        if (!this._serverdb.find(x => x.guildid === guildid)){ InitDB(guildid); }
        let nsfw = this._serverdb.find(x.guildid === guildid).nsfw;
        let index = nsfw.indexOf(channel);
        
        if(index > -1){ return true; }
        return false; 
    }
    
    // Add/remove/check bot-spam channel
    AddBotspam(channel, guildid){
        if (!this._serverdb.find(x => x.guildid === guildid)){ InitDB(guildid); }
        let botspam = this._serverdb.find(x.guildid === guildid).botspam;
        botspam.push(channel);
        this.WriteOut();
        //return message
    }
    
    RemoveBotspam(channel, guildid){
        if (!this._serverdb.find(x => x.guildid === guildid)){ InitDB(guildid); }
        
        let botspam = this._serverdb.find(x.guildid === guildid).botspam;
        let index = botspam.indexOf(channel);
        
        if(index > -1){
            botspam.splice(index, 1);
            this.WriteOut();
            //return message
        }
        //return message
    }

    IsBotspam(channel, guildid){
        if (!this._serverdb.find(x => x.guildid === guildid)){ InitDB(guildid); }
        
        let botspam = this._serverdb.find(x.guildid === guildid).botspam;
        let index = botspam.indexOf(channel);
        
        if(index > -1){ return true; }
        return false; 
    }

    // --------------------------
}

module.exports = LoungeBot;

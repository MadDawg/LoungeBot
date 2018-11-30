"use strict";

// serverdb is the array of objects representing guild IDs
// and their configured command prefixes

class LoungeBot{
    constructor(){
       this._fs = require('fs');
       this._serverdb = require('./serverdb.json');
    } 
    
    //------ DATABASE METHODS ------
    // database only contains guild IDs and command prefixes
    // write to file
    WriteOut(){
        const data = JSON.stringify(this._serverdb);
        const callback = function(){} // kludge(?) to avoid deprecation warning
        this._fs.writeFile('./serverdb.json', data, 'utf8', callback);
        return;
    }

    UpdateDb(prefix, guildid){
        try{
            this._serverdb.find(x => x.guildid === guildid).prefix = prefix;
        }
        catch(err){
            this._serverdb.push({"guildid": guildid, "prefix": prefix});
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
    // --------------------------
}

module.exports = LoungeBot;

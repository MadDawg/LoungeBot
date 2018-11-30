"use strict";

// remind users that saucebot is in alpha and will be replaced by loungebot

class SauceResult{
    constructor(img, simularity, info, hidden=false){
        this._img = img;
        this._simularity = simularity;
        this._info = info;
        this._hidden = hidden;
    }
    Embed(){}
}


class SauceBot{
    constructor(query){
        this._query = query;
    }
    Test(){
        const Browser = require('zombie');
        const Browser('https://saucenao.com');
    } 
}


module.exports = SauceBot;

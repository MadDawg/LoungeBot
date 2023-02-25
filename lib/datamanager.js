"use strict";

// TODO: consider moving anything that doesn't handle or rely on persistence
// (i.e. sauce-related functions) to other files and rename this file to datamanager.js or similar


// TODO: Discord now allows multiple attachments per message sent by a non-bot user,
// so now we have to figure out how to handle image dumps
// we could queue x images from the dump and drip-feed them to SauceNao
// keeps things from getting too spammy on Discord, SauceNao, etc.

import Discord from 'discord.js';
const { Collection } = Discord;
import { createLogger, config, transports as _transports, format as _format } from 'winston';
import envs from '../config.js';
const { BOT_COMMAND_PREFIX, BOT_TOKEN  } = envs;
import guildsDB from './db_objects.js';

class DataManager{
    constructor(){
        this.logger = createLogger({
            levels: config.syslog.levels,
            transports: [
                new _transports.Console(),
                //new winston.transports.File({ filename: 'log' }),
            ],
            format: _format.combine(
                _format.timestamp(),
                _format.errors({ stack: true }),
                //winston.format.colorize(),
                _format.printf(log => {
                    if (log.stack){
                        return `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message} - ${log.stack}`;
                    }
                    return `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`;
                }),
            ),
        });

        guildsDB.sync(); // make sure the database is initialized (BROKEN?)

        // used for SauceNAO backoff (measured in ms)
        this._saucenaoTimeout = {
            duration: -1,
            short: true
        };

        this.command_prefix = BOT_COMMAND_PREFIX;
        this.token = BOT_TOKEN;
        this.guilds = new Collection();
    }

    //------ DATABASE METHODS ------
    // database contains:
    // - guild IDs
    // - command prefixes
    // - botspam channels
    // - autosauce channels
    // - watchghostping boolean

    // helpers
    // more type abuse...
    async getGuild(guildid) {
        let guild = this.guilds.get(guildid);
        if (guild) {
            guild = {
                guildid: guildid,
                prefix: guild.prefix,
                botspam: guild.botspam,
                autosauce: guild.autosauce,
                watchghostpings: guild.watchghostpings
            }
        }
        else {
            const fetchedGuilds = await guildsDB.findOrCreate({ where: { guildid: guildid } });
            // created guild will come with defaults
            guild = fetchedGuilds[0];
            this.guilds.set(guildid, {
                prefix: guild.prefix,
                botspam: guild.botspam,
                autosauce: guild.autosauce,
                watchghostpings: guild.watchghostpings
            });
        }
        return guild;
    }

    async updateGuild(guild) {
        this.guilds.set(guild.guildid, {
            prefix: guild.prefix,
            botspam: guild.botspam,
            autosauce: guild.autosauce,
            watchghostpings: guild.watchghostpings
        });

        guildsDB.upsert({
            guildid: guild.guildid,
            prefix: guild.prefix,
            botspam: guild.botspam,
            autosauce: guild.autosauce,
            watchghostpings: guild.watchghostpings
        });
    }

    async removeGuild(guildid) {
        this.guilds.delete(guildid);
        guildsDB.destroy({
            where: {
                guildid: guildid
            }
        });
    }

    // "frontend"
    async getPrefix(guildid) {
        const guild = await this.getGuild(guildid);
        return guild.prefix;
    }

    async changePrefix(newprefix, guildid) {
        const guild = await this.getGuild(guildid);
        const oldprefix = guild.prefix;

        if (newprefix !== oldprefix) {
            guild.prefix = newprefix;
            this.updateGuild(guild);
        }

        return newprefix;
    }

    // Add/remove/check/list bot-spam channels
    async getBotSpam(guildid) {
        const guild = await this.getGuild(guildid);
        return guild.botspam;
    }

    async isBotSpam(channel, guildid) {
        const botspam = await this.getBotSpam(guildid);
        //const botspam = guild.botspam;
        const index = botspam.indexOf(channel);
        return index > -1;
    }

    async addBotSpam(channels, guildid) {
        const guild = await this.getGuild(guildid);
        const botspam = guild.botspam;
        //guild.botspam = Array.from(new Set([...botspam, ...channels]));
        const messages = [];
        for (let i = 0; i < channels.length; i++) {
            const channel = channels[i];
            if (await this.isBotSpam(channel.id, guildid)) {
                messages.push(`${channel.toString()} is already marked as bot-spam.`);
            }
            else {
                messages.push(`${channel.toString()} marked as bot-spam.`);
                botspam.push(channel.id);
            }
        }

        this.updateGuild(guild);
        return messages.join('\n');
    }

    async removeBotSpam(channels, guildid) {
        const guild = await this.getGuild(guildid);
        const botspam = guild.botspam;

        const messages = [];
        for (let i = 0; i < channels.length; i++) {
            const channel = channels[i];
            const index = botspam.indexOf(channel.id);
            if (index > -1) {
                botspam.splice(index, 1);
                messages.push(`${channel.toString()} is no longer marked as bot-spam.`);
            } else { messages.push(`${channel.toString()} is not marked as bot-spam.`); }
        }

        this.updateGuild(guild);
        return messages.join('\n');
    }

    // --------- Sauce/source related stuff -------------
    // TODO: add blacklist/whitelist for URLs to avoid sending garbage to SauceNAO
    async getAutoSauce(guildid) {
        const guild = await this.getGuild(guildid);
        return guild.autosauce;
    }

    async isAutoSauce(channel, guildid) {
        const autosauce = await this.getAutoSauce(guildid);
        const index = autosauce.indexOf(channel);
        return index > -1;
    }

    async addAutoSauce(channels, guildid) {
        const guild = await this.getGuild(guildid);
        const autosauce = guild.autosauce;

        const messages = [];
        for (let i = 0; i < channels.length; i++) {
            const channel = channels[i];
            if (await this.isAutoSauce(channel.id, guildid)) {
                messages.push(`${channel.toString()} is already marked for auto-sauce.`);
            } else {
                messages.push(`${channel.toString()} marked as auto-sauce.`);
                autosauce.push(channel.id);
            }
        }

        this.updateGuild(guild);
        return messages.join('\n');
    }

    async removeAutoSauce(channels, guildid) {
        const guild = await this.getGuild(guildid);
        const autosauce = guild.autosauce;

        const messages = [];
        for (let i = 0; i < channels.length; i++) {
            const channel = channels[i];
            const index = autosauce.indexOf(channel.id);
            if (index > -1) {
                autosauce.splice(index, 1);
                messages.push(`${channel.toString()} is no longer marked for auto-sauce.`);
            } else { messages.push(`${channel.toString()} is not marked for auto-sauce.`); }
        }

        this.updateGuild(guild);
        return messages.join('\n');
    }
    // --------------------------
}

export default DataManager;

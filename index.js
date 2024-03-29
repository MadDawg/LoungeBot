"use strict";

import { readdirSync, stat } from 'fs';
import got from 'got';
import Discord from 'discord.js';
const { Collection, Client, GatewayIntentBits, EmbedBuilder, ActivityType, ChannelType } = Discord;

const client = new Client({
    intents: [
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.Guilds,
        //GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.MessageContent
    ]
});

import DataManager from './lib/datamanager.js';
//const { type } = require('os');
import envs from './config.js';
const status_push_url = envs.STATUS_PUSH_URL;
import getSauce from './lib/saucefunctions.js';

const dm = new DataManager();
const logger = dm.logger;
const token = dm.token;
// TODO: allow per-guild API keys to avoid globally running out of searches
// and warn users that keys will be stored in database
// this assumes that SauceNAO doesn't block the bot's IP address
//const api_key = dm.api_key; 
const command_prefix = dm.command_prefix;

const guild_text_channels = [
    ChannelType.GuildText,
    ChannelType.GuildAnnouncement,
    ChannelType.AnnouncementThread,
    ChannelType.PublicThread
];

//client.commands = new Discord.Collection();
client.commands = new Collection();

const commandFiles = readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const { default: command } = await import(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// send a GET request to an API (e.g. Uptime Kuma)
function touchStatusAPI(){
    got(status_push_url).then(() => {
        //console.log('Message sent successfully');
    }).catch(error => {
        console.error('Failed to send message:', error.message);
    });
}

function goodbye(exitCode = 0){
    logger.info("Logging off!");
    client.destroy();
    process.exit(exitCode);
}

function badbye(error){
    logger.crit(error);
    goodbye(1);
}

process.on('SIGINT', goodbye);
process.on('SIGTERM', goodbye);
process.on('uncaughtException', badbye);
process.on('unhandledRejection', badbye);

client.on('ready', () => {
    // we'll forgive the usage of console.log here
    console.log("    __                                 ____        __ \n"
        + "   \/ \/   ____  __  ______  ____ ____  \/ __ )____  \/ \/_\n"
        + "  \/ \/   \/ __ \\\/ \/ \/ \/ __ \\\/ __ `\/ _ \\\/ __  \/ __ \\\/ __\/\n"
        + " \/ \/___\/ \/_\/ \/ \/_\/ \/ \/ \/ \/ \/_\/ \/  __\/ \/_\/ \/ \/_\/ \/ \/_  \n"
        + "\/_____\/\\____\/\\__,_\/_\/ \/_\/\\__, \/\\___\/_____\/\\____\/\\__\/  \n"
        + "                        \/____\/        \n"
        + "Enabling your laziness since 2019");

    client.user.setActivity('you all lose the sauce', {type: ActivityType.Watching});
});

client.on('messageCreate', async message => {
    // ignore messages from other bots
    if (message.author.bot) return;

    // check guild id and assign prefix appropriately
    // if guild id is not found in database, or if we are in a DM channel, use default prefix
    let prefix = command_prefix;
    if (guild_text_channels.includes(message.channel.type)) {
        prefix = await dm.getPrefix(message.guildId) || command_prefix;
    }
    

    // Conveniently, trailing whitespaces are eaten/ignored
    if (message.content === `<@${client.user.id}>` || message.content === `<@!${client.user.id}>`){
        message.reply({embeds: [new EmbedBuilder().setDescription(`My command prefix is \`${prefix}\``)] });
        return;
    }

    let args = [];

    // TODO: DRY this
    if (message.content.startsWith(prefix)){
        args = message.content.slice(prefix.length).split(/ +/);
    }
    // allow command execution on mention
    // TODO: maybe use regex?
    else if (message.content.startsWith(`<@${client.user.id}>`)){
        args = message.content.slice((`<@${client.user.id}>`).length).split(/ +/);
    }
    else if (message.content.startsWith(`<@!${client.user.id}>`)){
        args = message.content.slice((`<@!${client.user.id}>`).length).split(/ +/);
    }
    else{
        if (await dm.isAutoSauce(message.channelId, message.guildId)){
            getSauce(message, {
                args: [],
                manually_invoked: false,
                numres: "8",
                minsim: "65!"
            });
        }
        return;
    }

    if (args[0] === '') { args.splice(0,1); }

    // avoid breaking when prefix is entered with no command
    if (!args.length){ return; }

    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (command.disabled) return;

    if (command.guildOnly && message.channel.type === ChannelType.DM) {
        return message.reply({ content: 'I can\'t execute that command inside DMs!' });
    }

    // TODO: use hasAll function?
    // This breaks in DM channels, but it hopefully isn't an issue here 
    if (command.permissions && command.permissions.length){
        for (let i = 0; i < command.permissions.length; i++){
            const permission = command.permissions[i];
            if (!message.member.permissions.has(permission)){
                return message.reply({ content: `you need the following permissions: ${command.permissions.join(', ')}` });
            }
        }
    }

    if (command.args && !args.length){
        let reply = `no arguments provided!`;

        if (command.usage) {
            reply += `\nUsage: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.reply({ content: reply });
    }

    if (command.spammy){
        // allow spammy stuff in DM channel
        // TODO: add admin bypass
        const botspam = await dm.isBotSpam(message.channelId, message.guildId);
        if (!message.channel.type === ChannelType.DM && !botspam){
            return message.reply({ content: `This command can only be executed in channels marked by the bot as bot-spam.` });
        }
    }

    try {
        command.execute(message, args, dm);
    }
    catch (error) {
        logger.error(error);
        message.reply({ content: 'there was an error trying to execute that command!' });
    }
});

client.login(token);
if (status_push_url) { setInterval(touchStatusAPI, 60000); }

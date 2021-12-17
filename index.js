"use strict";

const fs = require('fs');
//const Discord = require('discord.js');
const { Collection, Client, Intents, MessageEmbed } = require('discord.js');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_BANS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
    ]
});

const LoungeBot = require('./lib/loungebot.js');
const { type } = require('os');

const bot = new LoungeBot();
const logger = bot.logger;
const token = bot.token;
// TODO: allow per-guild API keys to avoid globally running out of searches
// and warn users that keys will be stored in database
const api_key = bot.api_key; 
const command_prefix = bot.command_prefix;

const guild_text_channels = [
    "GUILD_TEXT",
    //"GUILD_NEWS",
    //"GUILD_NEWS_THREAD",
    "GUILD_PUBLIC_THREAD",
    "GUILD_PRIVATE_THREAD",
];

//client.commands = new Discord.Collection();
client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}



function goodbye(){
    logger.info("Logging off!");
    client.destroy();
}

function badbye(error){
    logger.crit(error);
    goodbye();
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

    client.user.setActivity('you all lose the sauce', {type: 'WATCHING'});
});

client.on('messageCreate', async message => {
    // ignore messages from other bots
    if (message.author.bot) return;

    // check guild id and assign prefix appropriately
    // if guild id is not found in database, or if we are in a DM channel, use default prefix
    let prefix = command_prefix;
    if (guild_text_channels.includes(message.channel.type)) {
        prefix = await bot.getPrefix(message.guild.id) || command_prefix;
    }
    

    // Conveniently, trailing whitespaces are eaten/ignored
    if (message.content === `<@${client.user.id}>` || message.content === `<@!${client.user.id}>`){
        message.reply({embeds: [new MessageEmbed().setDescription(`My command prefix is \`${prefix}\``)] });
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
        if (await bot.isAutoSauce(message.channel.id, message.guild.id)){
            bot.getSauce(message, {
                args: [],
                manually_invoked: false,
                numres: "8",
                minsim: "65!"
            });
        }
        return;
    }

    if (args[0] === '') args.splice(0,1);

    // avoid breaking when prefix is entered with no command
    if (!args.length){ return; }

    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (command.disabled) return;

    if (command.permissions && command.permissions.length){
        for (let i = 0; i < command.permissions.length; i++){
            const permission = command.permissions[i];
            if (!message.member.permissions.has(permission)){
                return message.reply({ content: `you need the following permissions: ${command.permissions.join(', ')}` });
            }
        }
    }

    if (command.guildOnly && !guild_text_channels.includes(message.channel.type)) {
        return message.reply({ content: 'I can\'t execute that command inside DMs!' });
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
        const botspam = await bot.isBotSpam(message.channel.id, message.guild.id);
        if (guild_text_channels.includes(message.channel.type) && !botspam){
            return message.reply({ content: `This command can only be executed in channels marked by the bot as bot-spam.` });
        }
    }

    try {
        command.execute(message, args, bot);
    }
    catch (error) {
        logger.error(error);
        message.reply({ content: 'there was an error trying to execute that command!' });
    }
});

client.login(token);

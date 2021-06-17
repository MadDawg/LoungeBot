# LoungeBot
### Dependencies
- [Node.js](https://nodejs.org/) v14.0.0+
- [PostgreSQL](https://www.postgresql.org/)

### Installation
Clone the repository and run `npm install` in the project directory. After doing so, you will need to create a config.json file with the following fields:
```
{
    "token":"YOUR_DISCORD_BOT_TOKEN_HERE",
    "command_prefix":"lb!",
    "saucenao_api_key":"YOUR_SAUCENAO_API_KEY_HERE"
}
```

You will also need to create a db_config.json with the following:
```
{
    "host": "NETWORK_LOCATION_OF_YOUR_POSTGRES_DATABASE",
    "database": "NAME_OF_DATABASE",
    "username": "USERNAME",
    "password": "PASSWORD"
}
```
### Launching the Bot
After installing and configuring the bot, simply type `node index.js`
### Commands
See ~~[COMMANDS.md](COMMANDS.md)~~ the built-in help command (for now)

# LoungeBot
### Dependencies
- [Node.js](https://nodejs.org/) v14.0.0+
- [PostgreSQL](https://www.postgresql.org/)

### Installation
Clone the repository and run `npm install` in the project directory. After doing so, you will need to create a .env file to configure the environment variables with the fields shown below.
If hosting on Heroku or similar, you can omit the .env file and use their dashboard to configure the environment variables instead.
```
BOT_TOKEN=your bot token
BOT_COMMAND_PREFIX=your desired command prefix (e.g. lb!)
SAUCENAO_API_KEY=your saucenao API key
DB_HOST=database URI
DB_NAME=database name
DB_USER=database username
DB_PASS=database user password
```
### Launching the Bot
After installing and configuring the bot, simply type `node index.js`
### Commands
See ~~[COMMANDS.md](COMMANDS.md)~~ the built-in help command (for now)

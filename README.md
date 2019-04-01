# LoungeBot
### Dependencies
The minimum version numbers needed are not known, but the ones given are known to work.
- [Node.js](https://nodejs.org/) v8.0.0+
- [Discord.js](https://discord.js.org/) v11.4.2+
- [Zombie.js](http://zombie.js.org/) v6.1.4+
- [Sequelize](http://docs.sequelizejs.com/) v5.2.8+
- sqlite v3.0.3=
- parse5 v5.1.0+
- xmldom v0.1.27+
- xmlserializer v0.6.1+
- xpath v0.0.27+
- node-cron v2.0.3+
- Python 3.4+
  - [lxml](https://lxml.de/) v3.5.0+
  - libxml2 v2.7.0+
  - libxslt v1.1.23+
  - pip/virtualenv

### Installation
After installing the dependencies, simply clone the repository. After doing so, you will need to create a config.json file with the following fields:
```
{
    "token":"YOUR_TOKEN_HERE",
    "command_prefix":"lb!"
}
```
### Launching the Bot
After installing and configuring the bot, simply type `node index.js`
### Commands
See [COMMANDS.md](COMMANDS.md)
### To Do
See [TODO.md](TODO.md)

const Sequelize = require('sequelize');

const { host, database, username, password } = require('../config/db_config.json');

const sequelize = new Sequelize(database, username, password, {
    host: host,
    dialect: 'postgres',
    logging: false,
});

const Guilds = require('../models/guild_settings.js')(sequelize, Sequelize.DataTypes);

module.exports = Guilds;
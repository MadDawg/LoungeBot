const Sequelize = require('sequelize');

const envs = require('../config.js');
const host = envs.DB_HOST;
const database = envs.DB_NAME;
const username = envs.DB_USER;
const password = envs.DB_PASS;

const sequelize = new Sequelize(database, username, password, {
    host: host,
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    },
    logging: false,
});

const Guilds = require('../models/guild_settings.js')(sequelize, Sequelize.DataTypes);

module.exports = Guilds;

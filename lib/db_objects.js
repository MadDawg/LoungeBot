import Sequelize, { DataTypes } from 'sequelize';

import { DB_HOST, DB_NAME, DB_USER, DB_PASS } from '../config.js';
const host = DB_HOST;
const database = DB_NAME;
const username = DB_USER;
const password = DB_PASS;

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

const Guilds = require('../models/guild_settings.js').default(sequelize, DataTypes);

export default Guilds;

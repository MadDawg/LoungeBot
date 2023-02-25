import Sequelize, { DataTypes } from 'sequelize';

//import { DB_HOST, DB_NAME, DB_USER, DB_PASS } from '../config.js';
import envs from '../config.js';
const { DB_HOST, DB_NAME, DB_USER, DB_PASS } = envs;
const host = DB_HOST;
const database = DB_NAME;
const username = DB_USER;
const password = DB_PASS;

const sequelize = new Sequelize(database, username, password, {
    host: host,
    dialect: 'postgres',
    /*dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    },*/
    logging: false,
});

import { default as guildSettings } from '../models/guild_settings.js';

const Guilds = guildSettings(sequelize, DataTypes);

export default Guilds;
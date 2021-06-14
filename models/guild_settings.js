"use strict";

// using postgresql

//------ DATABASE METHODS ------
// database contains:
// - guild IDs
// - command prefixes
// - botspam channels
// - autosauce channels
// - watchghostping boolean

// expected string format: [{"guildid":"", "prefix":"", "botspam":[], "autosauce":[], "watchghostpings":""}]

module.exports = (sequelize, DataTypes) => {
	return sequelize.define('guilds', {
		guildid: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		prefix: {
			type: DataTypes.STRING,
			defaultValue: "lb!",
			allowNull: false,
		},
        botspam: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
            allowNull: false,
        },
        autosauce: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
            allowNull: false,
        },
        watchghostpings: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
	}, {
		timestamps: false,
	});
};

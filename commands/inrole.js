"use strict";

// BROKEN!

const Discord = require('discord.js');

//TODO: include offline members also
//TODO: clean up variable names

module.exports = {
    name: 'inrole',
    aliases: ['intersectroles', 'roleintersect', 'whohas', 'inroles'],
    description: 'List users that are members of all given roles (empty roles are ignored)',
    guildOnly: true,
    args: true,
    usage: '<role1> [roleN...]',
    spammy: false,
    permissions: [],

    intersect(members1, members2){
        if (!members1.length || !members2.length) return [];
        /*if (!members1.length && !members2.length) return [];
        if (!members1.length) return members2;
        if (!members2.length) return members1;*/

        const members = members1.filter(member => members2.includes(member));
        return members;
    },

    find_role(message, id){
        return message.guild.roles.fetch(id);
    },

    create_embed(roles, total_users, pageno, total_pages, users){
        const embed = new Discord.MessageEmbed();
        embed.setTitle(`Users in role(s): ${total_users}`);
        embed.setColor(`#0000FF`);
        embed.setFooter(`${pageno}/${total_pages}`);
        embed.addField('Users', users);
        return embed;
    },

    async execute(message, args, bot){
        let final_list = []; // list containing the users we were searching for
        //let reply = "";
        let roles = [];
        let roles_str = ""; // formatted roles string
        let pages = []; // embed "pages"
        let page = 1; // page selector
        const users_per_page = 15;

        //args = Array.from(new Set(args)); // remove dupes
        const roles_mentioned = message.mentions.roles.array();

        //for (let i=0; i<args.length; i++){
        for (let i = 0; i < roles_mentioned.length; i++){
            try{
                //const matches = args[i].match(/^<@&(\d+)>$/);
                //const matches = args[i].match(Discord.MessageMentions.ROLES_PATTERN);
                //const id = matches[1];
                const role = roles_mentioned[i];
                const members = role.members.array();
                if (!members.length){ continue; } //ignore empty role
                if (roles.length < 3){ roles.push(role.name); }
                const member_tags = members.map(member => member.user.tag);

                // final_list is empty on first iteration,
                // so avoid intersecting it and just use member_tags
                if (i > 0){
                    final_list = this.intersect(final_list, member_tags);
                }
                else { final_list = member_tags; }
            }
            catch (err){
                if (err instanceof TypeError){
                    bot.logger.error(`${this.name}: invalid role entered`);
                }
            }
        }

        roles_str = roles.join(', ');
        if (roles.length >= 3){ roles_str+=", ..."; }

        const total_users = final_list.length;
        const total_pages = Math.ceil(total_users/users_per_page);

        if (total_users > 0){
            let members_str = "";
            let pageno = 1;
            let j = 1;
            for (let i=0; i < total_users; i++, j++){
                // create and push page once we reach 15 users
                if (j >= 15){
                    j = 0; // will be incremented when loop iterates
                    members_str += final_list[i] + '\n';
                    const embed = this.create_embed(roles_str, total_users, pageno, total_pages, members_str);
                    pages.push(embed);
                    members_str = "";
                    pageno++;
                }
                else{
                    members_str += final_list[i] + '\n';
                }
            }
            // push final page if there are any remaining users
            let embed = undefined;
            if (members_str != ""){
                embed = this.create_embed(roles_str, total_users, pageno, total_pages, members_str);
                pages.push(embed);
            }

            embed = pages[0];
            if (page > 0 && page <= total_pages){ embed = pages[page-1]; }

            message.channel.send(embed).then(async function (botmessage) {
                if (total_pages < 2) return;
                let keepgoing = true;
                while (keepgoing){
                    if(page-1 >= total_pages-1){
                        await botmessage.react("⬅️");
                    }
                    else if(page-1 <= 0){
                        await botmessage.react("➡️");
                    }
                    else{
                        await botmessage.react("⬅️").then(() => botmessage.react("➡️"));
                    }

                    const filter = (reaction, user) => {
                        return ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === message.author.id;
                    };

                    await botmessage.awaitReactions(filter, { max: 1, time: 10000, errors: ['time'] })
                        .then(async function (collected) {
                            const reaction = collected.first();

                            await botmessage.reactions.removeAll().catch(function(error){ bot.logger.error(`${error.name}: ${error.message}`); });
                            if (reaction.emoji.name === '➡️') {
                                // go to next page
                                if(page-1 >= total_pages-1) return;
                                await page++;
                            } else {
                                // go to previous page
                                if(page-1 <= 0) return;
                                await page--;
                            }
                            await botmessage.edit('', pages[page-1]).catch(bot.logger.error);
                        })
                        .catch(collected => {
                            botmessage.reactions.removeAll().catch(function(error){ bot.logger.error(`${error.name}: ${error.message}`); });
                            keepgoing = false;
                        });
                }
            }).catch(function(error){ bot.logger.error(`${error.name}: ${error.message}`); });
        }
        else{
            message.channel.send(`No users found.`);
        }
    },
};

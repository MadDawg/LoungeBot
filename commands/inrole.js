"use strict";

// BROKEN!

import { EmbedBuilder } from 'discord.js';

//TODO: include offline members also
//TODO: clean up variable names

export const name = 'inrole';
export const aliases = ['intersectroles', 'roleintersect', 'whohas', 'inroles'];
export const description = 'List users that are members of all given roles (empty roles are ignored)';
export const guildOnly = true;
export const args = true;
export const usage = '<role1> [roleN...]';
export const spammy = false;
export const disabled = true;
export const permissions = [];
export function intersect(members1, members2) {
    if (!members1.length || !members2.length)
        return [];
    /*if (!members1.length && !members2.length) return [];
    if (!members1.length) return members2;
    if (!members2.length) return members1;*/
    const members = members1.filter(member => members2.includes(member));
    return members;
}
export function find_role(message, id) {
    return message.guild.roles.fetch(id);
}
export function create_embed(roles, total_users, pageno, total_pages, users) {
    const embed = new EmbedBuilder();
    embed.setTitle(`Users in role(s): ${total_users}`);
    embed.setColor(`#0000FF`);
    embed.setFooter({ text: `${pageno}/${total_pages}` });
    embed.addFields({name: 'Users', value: users });
    return embed;
}
export async function execute(message, args, dm) {
    let final_list = []; // list containing the users we were searching for

    //let reply = "";
    let roles = [];
    let roles_str = ""; // formatted roles string
    let pages = []; // embed "pages"
    let page = 1; // page selector
    const users_per_page = 15;

    const roles_mentioned = message.mentions.roles;

    roles_mentioned.forEach((role) => {
        try{
            const members = role.members;
            if (!members.size){ return; } // ignore empty role
            if (roles.length < 3) { roles.push(role.name); }
            const member_tags = members.map(member => member.user.tag);

            // final_list is empty on first iteration,
            // so avoid intersecting it and just use member_tags
            if (final_list.length) {
                final_list = intersect(final_list, member_tags);
            }
            else { final_list = member_tags; }
        }
        catch (err) {
            if (err instanceof TypeError) {
                dm.logger.error(`${name}: invalid role entered`);
            }
        }
    });

    roles_str = roles.join(', ');
    if (roles.length >= 3) { roles_str += ", ..."; }

    const total_users = final_list.length;
    const total_pages = Math.ceil(total_users / users_per_page);

    if (total_users > 0) {
        let members_str = "";
        let pageno = 1;
        let j = 1;
        for (let i = 0; i < total_users; i++, j++) {
            // create and push page once we reach 15 users
            if (j >= 15) {
                j = 0; // will be incremented when loop iterates
                members_str += final_list[i] + '\n';
                const embed = create_embed(roles_str, total_users, pageno, total_pages, members_str);
                pages.push(embed);
                members_str = "";
                pageno++;
            }
            else {
                members_str += final_list[i] + '\n';
            }
        }
        // push final page if there are any remaining users
        let embed = undefined;
        if (members_str != "") {
            embed = create_embed(roles_str, total_users, pageno, total_pages, members_str);
            pages.push(embed);
        }

        embed = pages[0];
        if (page > 0 && page <= total_pages) { embed = pages[page - 1]; }

        message.reply({ embeds: [embed] }).then(async function (botmessage) {
            if (total_pages < 2)
                return;
            let keepgoing = true;
            while (keepgoing) {
                if (page - 1 >= total_pages - 1) {
                    await botmessage.react("⬅️");
                }
                else if (page - 1 <= 0) {
                    await botmessage.react("➡️");
                }
                else {
                    await botmessage.react("⬅️").then(() => botmessage.react("➡️"));
                }

                const filter = (reaction, user) => {
                    return ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === message.author.id;
                };

                await botmessage.awaitReactions(filter, { max: 1, time: 10000, errors: ['time'] })
                    .then(async function (collected) {
                        const reaction = collected.first();

                        await botmessage.reactions.removeAll().catch(function (error) { dm.logger.error(`${error.name}: ${error.message}`); });
                        if (reaction.emoji.name === '➡️') {
                            // go to next page
                            if (page - 1 >= total_pages - 1)
                                return;
                            await page++;
                        } else {
                            // go to previous page
                            if (page - 1 <= 0)
                                return;
                            await page--;
                        }
                        await botmessage.edit('', pages[page - 1]).catch(dm.logger.error);
                    })
                    .catch(collected => {
                        botmessage.reactions.removeAll().catch(function (error) { dm.logger.error(`${error.name}: ${error.message}`); });
                        keepgoing = false;
                    });
            }
        }).catch(function (error) { dm.logger.error(`${error.name}: ${error.message}`); });
    }
    else {
        message.reply({ content: `No users found.` });
    }
}

export default { name, aliases, description, guildOnly, args, usage, spammy, permissions, execute };
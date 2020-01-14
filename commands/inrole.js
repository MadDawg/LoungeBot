const Discord = require('discord.js');

//TODO: include offline members also
//TODO: clean up variable names

module.exports = {
    name: 'inrole',
    aliases: ['intersectroles', 'roleintersect', 'whohas', 'inroles'],
    description: 'List users that are members of all given roles',
    guildOnly: true,
    args: true,
    usage: '<role1> [... [roleN]]',
    spammy: false,
    admin: true, // for now...

    intersect(members1, members2){
        if (members1.length == 0 && members2.length == 0) return [];
        if (members1.length == 0) return members2;
        if (members2.length == 0) return members1;

        members = members1.filter(member => members2.includes(member));
        return members;
    },

    find_role(message, id){
        return message.guild.roles.get(id);
    },

    create_embed(roles, total_users, pageno, total_pages, users){
        const embed = new Discord.RichEmbed();
        embed.setTitle(`Users in role(s): ${total_users}`);
        embed.setColor(`#0000FF`);
        embed.setFooter(`${pageno}/${total_pages}`);
        embed.addField('Users', users);
        return embed;
    },

    execute(message, args, bot){
        let final_list = []; // list containing the users we were searching for
        let reply = "";
        let roles = [];
        let roles_str = ""; // formatted roles string
        let pages = []; // embed "pages"
        let page = 1; // page selector
        const users_per_page = 15;

        args = Array.from(new Set(args)); // remove dupes

        for (i=0; i<args.length; i++){
            try{
                const matches = args[i].match(/^<@&(\d+)>$/);

                const id = matches[1];

                role = this.find_role(message, id);
                members = role.members;
                if (roles.length < 3) roles.push(role.name);
                member_tags = members.map(member => member.user.tag);
                final_list = this.intersect(final_list, member_tags);
            }
            catch (TypeError){ /* nah */ }
        }

        roles_str = roles.join(', ');
        if (roles.length >= 3) roles_str+=", ...";

        const total_users = final_list.length;
        const total_pages = Math.ceil(total_users/users_per_page);

        if (total_users > 0){
            let members_str = "";
            let pageno = 1;
            for (i=0, j=1; i < total_users; i++, j++){
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
            if (members_str != ""){
                let embed = this.create_embed(roles_str, total_users, pageno, total_pages, members_str);
                pages.push(embed);
            }

            embed = pages[0];
            if (page > 0 && page <= total_pages){ embed = pages[page-1]; }

            message.channel.send(embed).then(async function (botmessage) {
                if (total_pages < 2) return;
                let keepgoing = true;
                while (keepgoing){
                    if(page-1 >= total_pages-1){
                        await botmessage.react("⬅️")
                    }
                    else if(page-1 <= 0){
                        await botmessage.react("➡️")
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

                            await botmessage.clearReactions().catch(function(error){ console.error(`${error.name}: ${error.message}`); });
    		                if (reaction.emoji.name === '➡️') {
                                // go to next page
                                if(page-1 >= total_pages-1) return;
                                await page++;
                            } else {
                                // go to previous page
                                if(page-1 <= 0) return;
                                await page--;
                            }
                            await botmessage.edit('', pages[page-1]).catch(console.error);
                        })
                        .catch(collected => {
                            botmessage.clearReactions().catch(function(error){ console.error(`${error.name}: ${error.message}`); });
                            keepgoing = false;
                        });
                }
            }).catch(function() {
                console.error("nope.");
            });
        }
        else{
            message.channel.send(`No users found.`);
        }
    },
  }

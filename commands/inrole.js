const Discord = require('discord.js');

//TODO: include offline members also
//TODO: clean up variable names
//TODO: unlock the witchcraft that is reaction control (the almighty Nadeko seems to have mastered it)
//TODO: optimize (e.g. do we need to store the first page if we aren't going to use it?)

module.exports = {
    name: 'inrole',
    aliases: ['intersectroles', 'roleintersect', 'whohas', 'inroles'],
    description: 'List users that are members of all given roles',
    guildOnly: true,
    args: true,
    usage: '<role1> [... [roleN]] [page]',
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
        //return message.guild.roles.find(role => role.id == id);
        return message.guild.roles.get(id);
    },

    create_embed(roles, total_users, pageno, total_pages, users){
        const embed = new Discord.RichEmbed();
        //embed.setTitle(`Users in ${roles}: ${total_users}`);
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
        let page = 0; // page selector
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
            catch (TypeError){
                // get page number if it exists
                try{
                    const pagematches = args[i].match(/^(\d+)$/);
                    page = pagematches[1];
                } catch (TypeError){ /* nah */ }
            }
        }

        roles_str = roles.join(', ');
        if (roles.length >= 3) roles_str+=", ...";

        const total_users = final_list.length;
        const total_pages = Math.ceil(total_users/users_per_page);

        if (total_users > 0){
            let members_str = "";
            let pageno = 1;
            for (i=0, j=1; i < total_users; i++, j++){
                // push page once we reach 15 users
                if (j == 15){
                    j = 1;
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
            // TODO: figure out what happens if we have 0 users here
            let embed = this.create_embed(roles_str, total_users, pageno, total_pages, members_str);
            pages.push(embed);

            embed = pages[0];
            if (page > 0 && page >= total_pages){ embed = pages[page-1]; }

            message.channel.send(embed);
        }
        else{
            message.channel.send(`No users found.`);
        }
    },
  }

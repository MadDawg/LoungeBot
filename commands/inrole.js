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
        //return message.guild.roles.find(role => role.id == id);
        return message.guild.roles.get(id);
    },

    display_page(number){
        //...
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
        let pages = [];
        const users_per_page = 15;

        args = Array.from(new Set(args)); // remove dupes

        for (i=0; i<args.length; i++){
            const matches = args[i].match(/^<@&(\d+)>$/);
            try{
                const id = matches[1];

                role = this.find_role(message, id);
                members = role.members;
                if (roles.length < 3) roles.push(role.name);
                member_tags = members.map(member => member.user.tag);
                final_list = this.intersect(final_list, member_tags);
            }
            catch (TypeError){
                //...
            }
        }

        /*for (i=0; i<roles.length; i++){
            if (i == roles.length-1) roles_str += roles[i];
            else roles_str += roles[i] + ', ';
        }*/
        roles_str = roles.join(', ');
        if (roles.length >= 3) roles_str+=", ...";

        const total_users = final_list.length;
        const total_pages = Math.ceil(total_users/users_per_page);

        if (total_users > 0){
            let members_str = "";
            let pageno = 1;
            for (i=0, j=1; i < total_users; i++, j++){
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
            let embed = this.create_embed(roles_str, total_users, pageno, total_pages, members_str);
            pages.push(embed);

            // always print the first page
            embed = pages[0];

            /*message.channel.send(embed).then(() => {
                if (pages.length > 0){
                    pageno = 0; // reusing previous pageno
                    //msg.react('⬅️').then(() => message.react('➡️'))
                    //   .catch((error) => console.error(`${error.name}: ${error.message}`));
                }
            });*/
            message.channel.send(embed);
            // I'd love to use a regular string...
            //msg.react('⬅️').then(() => message.react('➡️'))
            //    .catch((error) => console.error(`${error.name}: ${error.message}`));

        }
        else{
            message.channel.send(`No users found.`);
        }
    },
  }

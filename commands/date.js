"use strict";
// TODO: allow default timezone to be set by admin

module.exports = {
    name: 'date',
    aliases: [],
    description: 'Show date/time',
    guildOnly: false,
    args: false,
    usage: '[timezone]',
    spammy: false,
    permissions: [],

    execute(message, args, bot){
        const format = {
            timeZone: "UTC",
            hourCycle: "h24",
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZoneName: "short"
        };

        const date = new Date();

        try{
            format.timeZone = args[0];
            message.channel.send(date.toLocaleString('en-GB', format));
        }
        catch(err) {
            if (err instanceof RangeError || err instanceof TypeError){
                message.channel.send(`Invalid or unsupported timezone: ${format.timeZone}`);
                format.timeZone = "UTC";
                message.channel.send(date.toLocaleString('en-GB', format));
            }
        }
    },
};

"use strict";
// TODO: allow default timezone to be set by admin

export const name = 'date';
export const aliases = [];
export const description = 'Show date/time';
export const guildOnly = false;
export const args = false;
export const usage = '[timezone]';
export const spammy = false;
export const permissions = [];
export function execute(message, args, bot) {
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

    try {
        format.timeZone = args[0];
        message.reply({ content: date.toLocaleString('en-GB', format) });
    }
    catch (err) {
        if (err instanceof RangeError || err instanceof TypeError) {
            message.channel.send(`Invalid or unsupported timezone: ${format.timeZone}`);
            format.timeZone = "UTC";
            message.reply({ content: date.toLocaleString('en-GB', format) });
        }
    }
}

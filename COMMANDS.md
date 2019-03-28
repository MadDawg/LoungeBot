# Commands

The default command prefix is **lb!**

Arguments marked with `<>` are required.

Arguments marked with `[]` are optional.

`...` means that the command takes any number (including zero) of additional arguments.

### changeprefix
Changes the bot's command prefix.

**Aliases:** *chpre*

**Usage:** `lb!chpre <new prefix>`

**Example:** `lb!chpre lb@` 

### echo
Repeats given text.

**Aliases:** *print*

**Usage:** `lb!echo <text>`

**Example:** `lb!echo yo`

### listbotspam
Lists all channels marked as bot-spam.

**Aliases:** *lsbotspam, lsbs*

**Usage:** `lb!lsbs`

### setbotspam
Marks current channel as bot-spam.

**Aliases:** *setbs, addbotspam, addbs*

**Usage:** `lb!setbs`

### removebotspam
Unmarks current channel as bot-spam.

**Requires:** Manage channels

**Aliases:** *rmbs, rmbotspam*

**Usage:** `lb!rmbs`

### sauce
Searches for given image on SauceNao. Only works in channels marked as bot-spam, and only gives known safe results when run in a channel not marked as NSFW.

**Aliases:** *source*

**Usage:** `lb!sauce <image url>`

**Example:** `lb!sauce https://i.imgur.com/nhgYU4J.png`

### date
Display date/time. See [Wikipedia](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) for time zone values.

**Usage:** `lb!date [time zone]`

**Example:** `lb!date`

**Example:** `lb!date America/New_York`

### help
Sends DM listing all commands or info about a specific command.

~~**Aliases:** *man*~~

**Usage:** `lb!help [command]`

**Example:** `lb!help`

**Example:** `lb!help sauce`

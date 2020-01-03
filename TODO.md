# TODO

- add reset prefix command

~~- allow commands to be executed via mention~~
~~-- a mention with no command simply shows the prefix~~
~~-- a mention with an invalid command is silently ignored~~

- add pingallin <role> to individually ping all members in <role>

- add ability to see members common with roles (e.g. who is in both role1 and role2, etc.)

- add ability to ping ONLY users that have ALL of the given roles (i.e. ping only those that are role1 AND role2)

- add ability to mass-add users in an existing role to a new (additional) role

- add chat logging (to catch badmins trying to delete messages)

- add mutually exclusive roles

- add scheduling/reminder support (cron)

- ~~detect when sauce command is executed in a NSFW channel (set `hide=3` when not in NSFW channel); may require rewrite of sauce code~~

- ~~detect when sauce command is executed outside of a bot spamming channel; will require redesign of serverdb.json~~

- write a manual

- ~~add help command~~

- fix invalid URLs that may appear when performing sauce command

~~- figure out why help.js breaks~~

- convert htmlparser.py to javascript to remove python dependency

- remove commented-out code

- add permissions exception (i.e. for try...catch) to replace admin field in command files

- consider using sqlite or something to store database

~~- determine if it is even necessary to list Node dependencies in README.md~~

- add commands to empty roles, move users from a role to other roles

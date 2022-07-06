### Needs
- double check how region is handled with riot api & id / name conflicts
- cron Job to re-fetch lol/twitch account information and update name/etc
- figure out how to stop the job runner safely
- pagination with cursors based off of params, can these somehow clear the route cache on expiry?

### Wants
- better joi validation errors
- database transactions
- eslint
- docker?
- some way of looking at a channels video list, and the amount of games found on them, maybe help find more lol accounts to add for users
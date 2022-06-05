### Needs

- twitch api handling & regeneration of app oath token - [docs](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#client-credentials-grant-flow)
  - might be able to store in DB and use jobs to reset this
- look into riot and PUUID to see what native id we need to use
- update to new LoL api match endpoint ( getMatchesForAccountInPeriod / getMatchInfoById )
- update initial seed ( https://docs.google.com/spreadsheets/d/1qBwucv8qsuvMWsUH3i9OUpxJAnU59mV5EbP9P3j4A-Y/edit#gid=697540580 )
- admin UI to add new channels + lol acc
- update pgpromise code
- eslint+prettier
-

### Wants

- Test the new role response from api (teamPosition), can we remove python script for roles
- Add ranks to lol match for filtering
- add champ mastery to results
- UI to add own channels + lol accounts
- Job to re-fetch lol/twitch account information and update name/etc
- move cron job schedules to job files as properties on function
- update handling of duplicate twitch names

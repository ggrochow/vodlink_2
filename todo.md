### Needs

- database transactions
- eslint

### Wants

- admin UI to add new channels + lol acc
- Test the new role response from api (teamPosition), can we remove python script for roles
- Add ranks to lol match for filtering
- add champ mastery to results
- UI to add own channels + lol accounts
- Job to re-fetch lol/twitch account information and update name/etc
- move cron job schedules to job files as properties on function
- update handling of duplicate twitch names
- view # of results by hero to display #s on hero grids for all results
  - number of games in any champs pov
    - number of games by role given champ
      - number of games per opponent given role + champ
- also store lol summonerId alongside puuid to store champ mastery / current rank
  - https://developer.riotgames.com/apis#league-v4/GET_getLeagueEntriesForSummoner
  - https://developer.riotgames.com/apis#champion-mastery-v4/GET_getChampionMastery
- can do a regular summoner ranked acc lookup to set it to inactive if account becomes inactive?
- docker?
# docker start ddeb17e8f1e1
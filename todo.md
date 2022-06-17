### Needs
- admin UI to add new channels + lol acc
- UI to add own channels + lol accounts
- double check how region is handled with riot api & id / name conflicts
- cron Job to re-fetch lol/twitch account information and update name/etc
- view # of results by hero to display #s on hero grids for all results
  - number of games in any champs pov
    - number of games per role, given champ
      - number of games per opponent champ, given role + champ
      
### Wants
- database transactions
- eslint
- move cron job schedules to job files as properties on function
- can do a regular summoner ranked acc lookup to set it to inactive if account becomes inactive?
- docker?
- service to get twitch app oath key and create job if fails + return error

# docker start ddeb17e8f1e1
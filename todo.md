### Needs
- double check how region is handled with riot api & id / name conflicts
- cron Job to re-fetch lol/twitch account information and update name/etc
- view # of results by hero to display #s on hero grids for all results
  - number of games in any champs pov
    - number of games per role, given champ
      - number of games per opponent champ, given role + champ
      
### Wants
- figure out how to stop the job runner safely
- better joi validation errors
- database transactions
- eslint
- docker?
- service to get twitch app oath key and create job if fails + return error
- some way of looking at a channels video list, and the amount of games found on them, maybe help find more lol accounts to add for users
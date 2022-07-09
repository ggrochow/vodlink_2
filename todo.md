### Needs
- double check how region is handled with riot api & id / name conflicts
- pagination with cursors based off of params, store cursor id in DB table, update it before fetching new vods
- pagination info for fullsearch
- fix blank roles caused by blank teamposition from api response
- check vod existence clear lmp vodlink id
### Wants
- proper FK relations
- better joi validation errors
- database transactions
- some way of looking at a channels video list, and the amount of games found on them, maybe help find more lol accounts to add for users
- axios can error and not have a status
- refactor cleanup jobs, delete lol games

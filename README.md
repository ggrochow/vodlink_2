# VODLINK

A tool to link League of Legends matches to twitch streamers VODs.
Allowing users to find timestamps to vods to watch based on a given champion matchup.
Automatically fetches matches & vods from Twitch/LoL APIs grabbing new data daily.

### Requirements

postgres 11.4
redis ??
node 12.6.0

### Setup

- Ensure all requirements are installed at the correct version.
- Create postgres DB
- Populate .env file `cp example.env .env`
- `npm install`
- `npm run migrate_database`
- `npm run seed-database`
- You can now run job system to populate the database

### Running

There are 3 separate things to run for this to operate fully.
They can be ran on separate servers as long as the .env file is configured correctly for each.
Make sure you are running the start commands from project root to ensure the .env file is found/used.

1. Job System
   - Queries Twitch/LoL Apis to fetch new data, as well as cleaning up old stale data.
   - RUN: `node job_system/index.js`
2. API Server
   - Serves various api data
   - RUN `node api/index.js`

### Folder Structure

- database - Database Queries & Setup
  - migrations - Database migration files
- external_apis - functions that make calls to twitch/lol APIs to get data
- job_system
  - job_queue - job queue, types, runner & related jobs
  - scheduled_jobs - scheduled job runner & related jobs
- utils - utility functions and folders
  - lol_data - League of legends constants and champion Info
  - scripts - package.json scripts

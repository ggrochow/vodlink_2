CREATE TABLE twitch_channels (
    id                  serial      PRIMARY KEY,
    native_channel_id   BIGINT      UNIQUE NOT NULL,
    channel_name        VARCHAR     NOT NULL
);

CREATE TABLE lol_summoners (
    id                  serial      PRIMARY KEY,
    native_summoner_id  VARCHAR     UNIQUE NOT NULL,
    native_puuid        VARCHAR     UNIQUE NOT NULL,
    summoner_name       VARCHAR     UNIQUE NOT NULL,
    region              VARCHAR     NOT NULL,
    twitch_channel_id   INTEGER     NOT NULL
);

CREATE TABLE twitch_vods (
    id                  serial      PRIMARY KEY,
    started_at          TIMESTAMP   NOT NULL,
    ended_at            TIMESTAMP   NOT NULL,
    twitch_channel_id   INTEGER     NOT NULL,
    native_vod_id       BIGINT      UNIQUE NOT NULL
);

CREATE TABLE lol_matches (
    id                  serial      PRIMARY KEY,
    native_match_id     VARCHAR     UNIQUE NOT NULL,
    winning_team        INTEGER     NOT NULL,
    started_at          TIMESTAMP   NOT NULL,
    ended_at            TIMESTAMP   NOT NULL,
    region              VARCHAR     NOT NULL
);

CREATE TABLE lol_match_participants (
    id                  serial      PRIMARY KEY,
    lol_match_id        INTEGER     NOT NULL,
    team_id             INTEGER     NOT NULL,
    champion_id         INTEGER     NOT NULL,
    role                VARCHAR     NOT NULL,
    summoner_name       VARCHAR     NOT NULL,
    native_summoner_id  VARCHAR     NOT NULL,
    native_puuid        VARCHAR     NOT NULL,
    rune_1              INTEGER     NOT NULL,
    rune_2              INTEGER     NOT NULL,
    rune_3              INTEGER     NOT NULL,
    rune_4              INTEGER     NOT NULL,
    rune_5              INTEGER     NOT NULL,
    rune_6              INTEGER     NOT NULL,
    rank_tier           VARCHAR,
    rank_rank           VARCHAR,
    rank_lp             INTEGER,
    mastery_level       INTEGER,
    mastery_points      INTEGER
);

CREATE TABLE lol_match_twitch_vods (
    id                  serial      PRIMARY KEY,
    lol_match_id        INTEGER     NOT NULL,
    twitch_vod_id       INTEGER     NOT NULL,
    vod_timestamp       INTEGER     NOT NULL
);

CREATE TABLE settings (
    id                  serial      PRIMARY KEY,
    setting_type        VARCHAR     NOT NULL UNIQUE,
    setting_value       VARCHAR     NOT NULL
);

CREATE TYPE job_type_enum AS ENUM (
    'FETCH_TWITCH_CHANNEL_ID',
    'FETCH_LOL_SUMMONER_ID',
    'FETCH_NEW_TWITCH_VODS',
    'FETCH_LOL_MATCHES_DURING_VOD',
    'FETCH_LOL_MATCH_INFO',
    'DETERMINE_LOL_MATCH_ROLES',
    'ASSOCIATE_LOL_MATCH_TO_TWITCH_VOD',
    'CLEANUP_EXPIRED_TWITCH_VODS',
    'CHECK_VOD_EXISTENCE',
    'FETCH_NEW_ACCESS_TOKEN',
    'FETCH_EXTRA_LOL_PARTICIPANT_INFO',
    'FETCH_LOL_PARTICIPANT_RANK',
    'FETCH_LOL_PARTICIPANT_MASTERY'
);

CREATE TYPE job_status_enum AS ENUM (
    'NEW',
    'RUNNING',
    'RETRY',
    'FINISHED',
    'ERROR'
);

CREATE TABLE jobs (
    id          serial              PRIMARY KEY,
    job_type    job_type_enum       NOT NULL,
    status      job_status_enum     NOT NULL,
    payload     JSONB               NOT NULL,
    priority    INTEGER             NOT NULL,
    errors      VARCHAR
);

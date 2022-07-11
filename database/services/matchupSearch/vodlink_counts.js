const db = require("../../models/raw_queries");
const {
  roleJoinString,
  roleName,
  joinName,
  getJoinType,
  getMatchupBody,
} = require("./utils");

async function vodlinkChampionCounts(matchupInfo) {
  const { joins, params, filters, wheres } = await getMatchupBody(matchupInfo);
  const counts = await getRoleCounts(
    matchupInfo,
    joins,
    params,
    filters,
    wheres
  );

  return { role: matchupInfo.COUNT_ROLE, counts };
}

async function getRoleCounts(matchupInfo, joins, params, filters, wheres) {
  const role = matchupInfo.COUNT_ROLE;
  const streamerRoleName = `ALLY_${matchupInfo.ROLE}`;
  const filterString = `${joinName(role)}.champion_id`;
  const queryWheres = wheres.filter((string) => !string.includes(filterString));

  if (role.includes("ALLY")) {
    let query = `
            SELECT
                ${joinName(role)}.champion_id AS champion_id,
                count(distinct(lm.id))::int
            FROM
                lol_matches lm
            ${joins.join("\n\t")}
            WHERE
                ${queryWheres.join("\n\tand ")}
            GROUP BY
                ${joinName(role)}.champion_id
        `;

    if (role === streamerRoleName) {
      return await db.manyOrNone(query, params);
    } else {
      if (filters.ally.includes(role)) {
        return await db.manyOrNone(query, params);
      } else {
        const queryJoins = [...joins];
        const queryParams = { ...params };
        queryJoins.push(
          roleJoinString(
            joinName(role),
            getJoinType(streamerRoleName, filters, role)
          )
        );

        // if streamer role is included and only enemy champ
        const lastQuery = queryWheres[queryWheres.length - 1];
        const isVodlinkWhere = lastQuery.includes(
          "lol_match_twitch_vods_id IS NOT NULL"
        );
        if (isVodlinkWhere) {
          const baseString = `${lastQuery.slice(0, lastQuery.length - 2)}`;
          // baseString is ( CONDITION OR CONDITION
          queryWheres[queryWheres.length - 1] = `${baseString} OR ${joinName(
            role
          )}.lol_match_twitch_vods_id IS NOT NULL )`;
        }

        queryWheres.push(`${joinName(role)}.role = ${roleName(role)}`);
        query = `    
            SELECT
                ${joinName(role)}.champion_id AS champion_id,
                count(DISTINCT(lm.id))::int
            FROM
                lol_matches lm
            ${queryJoins.join("\n\t")}
            WHERE
                ${queryWheres.join("\n\tand ")}
            GROUP BY
                ${joinName(role)}.champion_id 
          `;

        return await db.manyOrNone(query, queryParams);
      }
    }
  } else {
    if (filters.enemy.includes(role)) {
      const query = `    
            SELECT
                ${joinName(role)}.champion_id AS champion_id,
                count(distinct(lm.id))::int
            FROM
                lol_matches lm
            ${joins.join("\n\t")}
            WHERE
                ${queryWheres.join("\n\tand ")}
            GROUP BY
                ${joinName(role)}.champion_id
          `;
      return await db.manyOrNone(query, params);
    } else {
      const queryJoins = [...joins];
      const queryParams = { ...params };

      if (filters.ally.length === 5) {
        queryJoins.push(
          roleJoinString(
            joinName(role),
            `!= ${joinName(filters.ally[0])}.team_id`
          )
        );
      } else {
        queryJoins.push(
          roleJoinString(
            joinName(role),
            getJoinType(streamerRoleName, filters, role)
          )
        );
      }

      queryWheres.push(`${joinName(role)}.role = ${roleName(role)}`);
      const query = `    
            SELECT
                ${joinName(role)}.champion_id AS champion_id,
                count(DISTINCT(lm.id))::int
            FROM
                lol_matches lm
            ${queryJoins.join("\n\t")}
            WHERE
                ${queryWheres.join("\n\tand ")}
            GROUP BY
                ${joinName(role)}.champion_id 
          `;

      return await db.manyOrNone(query, queryParams);
    }
  }
}

module.exports = {
  vodlinkChampionCounts,
};

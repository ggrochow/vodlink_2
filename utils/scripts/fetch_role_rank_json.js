const fs = require("fs");
const { LOL_RANKS, LOL_ROLES } = require("../lol_data");
const { getPlaiceholder } = require("plaiceholder");

const lolDataPath = "utils/lol_data"; // from project root
function titleCase(str) {
  return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

async function run() {
  const lolRoleJson = {};
  const lolRankJson = {};
  for (const rank of LOL_RANKS) {
    const roleImageUrl = `/static/ranks/Emblem_${titleCase(rank)}.png`;
    const fullUrl = `http://localhost:3000${roleImageUrl}`;
    const { base64: roleBase64 } = await getPlaiceholder(fullUrl);
    lolRankJson[rank] = {
      rank,
      imageSrc: roleImageUrl,
      imagePlaceholder: roleBase64,
    };

    lolRoleJson[rank] = {};
    for (const role of LOL_ROLES) {
      const rankImageUrl = `/static/roles/Position_${titleCase(
        rank
      )}-${titleCase(role)}.png`;
      const fullUrl2 = `http://localhost:3000${rankImageUrl}`;
      const { base64: rankBase64 } = await getPlaiceholder(fullUrl2);
      lolRoleJson[rank][role] = {
        rank,
        role,
        imageSrc: rankImageUrl,
        imagePlaceholder: rankBase64,
      };
    }
  }

  fs.writeFileSync(`${lolDataPath}/ranks.json`, JSON.stringify(lolRankJson));
  fs.writeFileSync(`${lolDataPath}/roles.json`, JSON.stringify(lolRoleJson));
}

run();

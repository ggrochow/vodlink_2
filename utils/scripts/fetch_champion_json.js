const fs = require("fs");
const axios = require("axios");
const championJsonPath = "utils/lol_data/champion.json"; // from project root
const versionsUrl = "https://ddragon.leagueoflegends.com/realms/na.json";
const plaiceholder = require("plaiceholder");

function request(uri) {
  return axios.get(uri);
}

async function run() {
  let versionsJson = await request(versionsUrl);
  versionsJson = versionsJson.data;
  let championVersion = versionsJson.n.champion;
  let championUrl = `http://ddragon.leagueoflegends.com/cdn/${championVersion}/data/en_US/champion.json`;
  let championJson = await request(championUrl);
  championJson = championJson.data;

  let championById = {};
  for (let key in championJson.data) {
    let championInfo = championJson.data[key];
    const imageUrl = `https://ddragon.leagueoflegends.com/cdn/${championVersion}/img/champion/${championInfo.id}.png`;
    const { base64 } = await plaiceholder.getPlaiceholder(imageUrl);
    championById[championInfo.key] = {
      name: championInfo.name,
      id: championInfo.id,
      key: championInfo.key,
      placeholderBase64: base64,
      imageUrl,
    };
  }

  fs.writeFileSync(championJsonPath, JSON.stringify(championById));
}

run();

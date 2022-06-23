const fs = require("fs");
const axios = require("axios");
const championJsonPath = "utils/lol_data/runes.json"; // from project root
const versionsUrl = "https://ddragon.leagueoflegends.com/realms/na.json";
const plaiceholder = require("plaiceholder");

function request(uri) {
  return axios.get(uri);
}

async function run() {
  let versionsJson = await request(versionsUrl);
  versionsJson = versionsJson.data;
  const championVersion = versionsJson.n.champion;
  const championUrl = `http://ddragon.leagueoflegends.com/cdn/${championVersion}/data/en_US/runesReforged.json`;
  const runesResponse = await request(championUrl);
  const runeData = runesResponse.data;

  const runeJson = {};

  for (const runeArray of runeData) {
    const imageUrl = `http://ddragon.leagueoflegends.com/cdn/img/${runeArray.icon}`;
    const { base64 } = await plaiceholder.getPlaiceholder(imageUrl);
    runeJson[runeArray.id] = {
      id: runeArray.id,
      key: runeArray.key,
      name: runeArray.name,
      imageSrc: imageUrl,
      imagePlaceholder: base64,
    };

    for (const slotNumber in runeArray.slots) {
      const slot = runeArray.slots[slotNumber];
      for (const rune of slot.runes) {
        const runeImageUrl = `http://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`;
        const { base64: runeBase64 } = await plaiceholder.getPlaiceholder(
          runeImageUrl
        );
        runeJson[rune.id] = {
          id: rune.id,
          key: rune.key,
          name: rune.name,
          imageSrc: runeImageUrl,
          imagePlaceholder: runeBase64,
          parentCategory: runeArray.id,
          slot: slotNumber,
        };
      }
    }
  }

  fs.writeFileSync(championJsonPath, JSON.stringify(runeJson));
}

run();

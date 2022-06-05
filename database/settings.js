const db = require("./raw_queries");

const settingTypes = {
  TWITCH_ACCESS_TOKEN: "TWITCH_ACCESS_TOKEN",
};

function upsertSetting(settingType, settingValue) {
  const query = `
    INSERT INTO settings
           (setting_type, setting_value) 
    VALUES ( $(settingType), $(settingValue) )
    ON CONFLICT ON CONSTRAINT settings_setting_type_key
    DO UPDATE SET setting_value = EXCLUDED.setting_value
    RETURNING *
  `;
  const params = {
    settingType,
    settingValue,
  };

  return db.queryOne(query, params);
}

function getSetting(settingType) {
  const query = `
    SELECT * 
    FROM settings
    WHERE setting_type = $(settingType)
  `;

  const params = {
    settingType,
  };

  return db.queryOne(query, params);
}

module.exports = {
  upsertSetting,
  getSetting,
  settingTypes,
};

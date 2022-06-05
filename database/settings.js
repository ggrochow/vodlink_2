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

function getSettingValue(settingType) {
  const query = `
    SELECT setting_value
    FROM settings
    WHERE setting_type = $(settingType)
  `;

  const params = {
    settingType,
  };

  return db.queryOne(query, params);
}

function getAccessToken() {
  return getSettingValue(settingTypes.TWITCH_ACCESS_TOKEN);
}

module.exports = {
  settingTypes,
  upsertSetting,
  getAccessToken,
};

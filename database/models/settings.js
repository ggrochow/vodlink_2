const db = require("./raw_queries");

const settingTypes = {
  TWITCH_ACCESS_TOKEN: "TWITCH_ACCESS_TOKEN",
  VODLINK_PAGINATION_CURSOR: "VODLINK_PAGINATION_CURSOR",
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

  return db.one(query, params);
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

  return db.oneOrNone(query, params);
}

function getAccessToken() {
  return getSettingValue(settingTypes.TWITCH_ACCESS_TOKEN);
}

function getVodlinkPaginationCursor() {
  return getSettingValue(settingTypes.VODLINK_PAGINATION_CURSOR);
}

module.exports = {
  settingTypes,
  upsertSetting,
  getVodlinkPaginationCursor,
  getAccessToken,
};

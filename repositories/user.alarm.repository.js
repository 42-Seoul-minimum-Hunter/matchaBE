const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const logger = require("../configs/logger.js");

require("dotenv").config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

client.connect();

const saveAlarmById = async (userId, alarmedId, alarmType) => {
  try {
    logger.info(
      "user.alarm.repository.js saveAlarmById: " +
        userId +
        ", " +
        alarmedId +
        ", " +
        alarmType
    );

    if (alarmType === "VISITED" || alarmType === "MESSAGED") {
      const result = await client.query(
        `
              SELECT * FROM user_alarm_histories
              WHERE user_id = $1 AND alarmed_id = $2 AND alarm_type = $3
              AND created_at < NOW() - INTERVAL '24 hours'
              `,
        [userId, alarmedId, alarmType]
      );

      if (result.rows.length > 0) {
        return;
      }
    }
    await client.query(
      `
            INSERT INTO user_alarm_histories
            (user_id, alarmed_id, alarm_type)
            VALUES ($1, $2, $3)
            `,
      [userId, alarmedId, alarmType]
    );
  } catch (error) {
    logger.error(
      "user.alarm.repository.js saveAlarmById error: " + error.message
    );
    throw error;
  }
};

const findAllAlarmsById = async (id) => {
  try {
    logger.info("user.alarm.repository.js findAllAlarmsById: " + id);
    const result = await client.query(
      `
            SELECT * FROM user_alarm_histories
            WHERE alarmed_id = $1 AND deleted_at IS NULL
            ORDER BY created_at DESC
            `,
      [id]
    );

    return result.rows;
  } catch (error) {
    logger.error(
      "user.alarm.repository.js findAllAlarmsById error: " + error.message
    );
    throw error;
  }
};

const deleteAllAlarmsById = async (id) => {
  try {
    logger.info("user.alarm.repository.js deleteAllAlarmsById: " + id);

    await client.query(
      `
      UPDATE user_alarm_histories
      SET deleted_at = NOW()
      WHERE alarmed_id = $1 
        AND deleted_at IS NULL 
        AND created_at < NOW() - INTERVAL '24 hours'
      `,
      [id]
    );
  } catch (error) {
    logger.error(
      "user.alarm.repository.js deleteAllAlarmsById error: " + error.message
    );
    throw error;
  }
};

module.exports = {
  saveAlarmById,
  findAllAlarmsById,
  deleteAllAlarmsById,
};

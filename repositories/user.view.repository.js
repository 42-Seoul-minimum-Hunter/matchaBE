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

const getViewedHistoriesById = async (id, viewedId) => {
  try {
    logger.info(
      "user.view.repository.js getViewedHistoriesById: " + id + ", " + viewedId
    );
    const viewedHistories = await client.query(
      `
            SELECT * FROM user_view_histories
            WHERE user_id = $1 AND viewed_id = $2
        `,
      [id, viewedId]
    );

    return viewedHistories.rows;
  } catch (error) {
    logger.error(
      "user.view.repository.js getViewedHistoriesById: " + error.message
    );
    throw error;
  }
};

const updateViewedHistoriesById = async (id, viewedId) => {
  try {
    logger.info(
      "user.view.repository.js updateViewedHistoriesById: " +
        id +
        ", " +
        viewedId
    );
    await client.query(
      `
            UPDATE user_view_histories
            SET deleted_at = NOW()
            WHERE user_id = $1 AND viewed_id = $2
        `,
      [id, viewedId]
    );
  } catch (error) {
    logger.error(
      "user.view.repository.js updateViewedHistoriesById: " + error.message
    );
    throw error;
  }
};

const saveVisitHistoryById = async (id, viewedId) => {
  try {
    logger.info(
      "user.view.repository.js saveVisitHistoryById: " + id + ", " + viewedId
    );

    await client.query(
      `
                INSERT INTO user_view_histories (user_id, viewed_id, created_at)
                VALUES ($1, $2, now())
            `,
      [id, viewedId]
    );
  } catch (error) {
    logger.error(
      "user.view.repository.js saveVisitHistoryById: " + error.message
    );
    throw error;
  }
};

module.exports = {
  getViewedHistoriesById,
  updateViewedHistoriesById,
  saveVisitHistoryById,
};

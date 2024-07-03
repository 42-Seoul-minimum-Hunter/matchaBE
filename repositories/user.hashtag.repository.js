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

const findHashtagById = async (id) => {
  try {
    logger.info("user.hashtag.repository.js findHashtagById: " + id);
    const hashtagInfo = await client.query(
      "SELECT hashtags FROM user_hashtags WHERE user_id = $1",
      [id]
    );
    return hashtagInfo.rows.map((row) => row.hashtags);
  } catch (error) {
    logger.error("user.hashtag.repository.js findHashtagById error: " + error.message);
    throw error;
  }
};

const updateHashtagById = async (hashtags, userId) => {
  try {
    logger.info("user.hashtag.repository.js updateHashtagById: " + hashtags + ", " + userId);
    await client.query(
      "UPDATE user_hashtags SET hashtags = $1 WHERE user_id = $2",
      [hashtags, userId]
    );
  } catch (error) {
    logger.error("user.hashtag.repository.js updateHashtagById error: " + error.message);
    throw error;
  }
};

const saveHashtagById = async (hashtags, id) => {
  try {
    logger.info("user.hashtag.repository.js saveHashtagById: " + hashtags + ", " + id)
    await client.query(
      `INSERT INTO user_hashtags (
                user_id,
                hashtags,
                updated_at
            ) VALUES ($1, $2, now())
            `,
      [id, hashtags]
    );
  } catch (error) {
    logger.error("user.hashtag.repository.js saveHashtagById error: " + error.message);
    throw error;
  }
};

module.exports = {
  findHashtagById,
  updateHashtagById,
  saveHashtagById,
};

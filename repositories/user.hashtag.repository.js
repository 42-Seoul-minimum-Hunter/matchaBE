const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

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
    const hashtagInfo = await client.query(
      "SELECT hashtags FROM user_hashtags WHERE user_id = $1",
      [id]
    );
    return hashtagInfo.rows.map((row) => row.hashtags);
  } catch (error) {
    return { error: error.message };
  }
};

const updateHashtagById = async (hashtags, userId) => {
  try {
    await client.query(
      "UPDATE user_hashtags SET hashtags = $1 WHERE user_id = $2",
      [hashtags, userId]
    );
  } catch (error) {
    return { error: error.message };
  }
};

const saveHashtagById = async (hashtags, id) => {
  try {
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
    console.log(error);
    throw error;
  }
};

module.exports = {
  findHashtagById,
  updateHashtagById,
  saveHashtagById,
};

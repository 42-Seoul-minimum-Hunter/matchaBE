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

const rateUser = async (ratedUserId, rateScore, userId) => {
  try {
    logger.info(
      "user.rate.repository.js rateUser: " +
        ratedUserId +
        ", " +
        rateScore +
        ", " +
        userId
    );
    // 기존 데이터 확인
    const existingRatingResult = await client.query(
      `
            SELECT * 
            FROM user_ratings
            WHERE user_id = $1 AND rated_id = $2
        `,
      [userId, ratedUserId]
    );

    if (existingRatingResult.rows.length === 0) {
      await client.query(
        `
                INSERT INTO user_ratings (
                    user_id,
                    rated_id,
                    rate_score,
                    rated_at
                ) VALUES ($1, $2, $3, now())
            `,
        [userId, ratedUserId, rateScore]
      );
    } else {
      await client.query(
        `
                UPDATE user_ratings
                SET rate_score = $1, rated_at = now()
                WHERE user_id = $2 AND rated_id = $3
            `,
        [rateScore, userId, ratedUserId]
      );
    }
  } catch (error) {
    logger.error("user.rate.repository.js rateUser: " + error.message);
    throw error;
  }
};

const findRateInfoById = async (id) => {
  try {
    logger.info("user.rate.repository.js findRateInfoById: " + id);
    const ratingInfo = await client.query(
      "SELECT * FROM user_ratings WHERE rated_id = $1",
      [id]
    );

    if (ratingInfo.rows.length === 0) {
      return null;
    }

    return ratingInfo.rows;
  } catch (error) {
    logger.error("user.rate.repository.js findRateInfoById: " + error.message);
    throw error;
  }
};

const findRateAvgByUserId = async (id) => {
  try {
    logger.info("user.rate.repository.js findRateAvgByUserId: " + id);
    const meanRate = await client.query(
      `
            SELECT AVG(rate_score) AS mean_rate
            FROM user_ratings
            WHERE rated_id = $1
        `,
      [id]
    );

    if (meanRate.rows[0].mean_rate === null) {
      return 0;
    }

    return meanRate.rows[0].mean_rate;
  } catch (error) {
    logger.error(
      "user.rate.repository.js findRateAvgByUserId: " + error.message
    );
    throw error;
  }
};

module.exports = {
  rateUser,
  findRateInfoById,
  findRateAvgByUserId,
};

const { Client } = require("pg");
const fs = require("fs");
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

const reportUser = async (reportedUserId, userId) => {
  try {
    logger.info(
      "user.report.repository.js reportUser: " + reportedUserId + ", " + userId
    );
    await client.query(
      `
            INSERT INTO user_reports (
                user_id,
                reported_id,
                created_at
            ) VALUES ($1, $2, now())
             RETURNING *
        `,
      [userId, reportedUserId]
    );
  } catch (error) {
    logger.error("user.report.repository.js reportUser: " + error.message);
    throw error;
  }
};

module.exports = {
  reportUser,
};

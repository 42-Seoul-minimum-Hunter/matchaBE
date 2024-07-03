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

const findRegionById = async (id) => {
  try {
    logger.info("user.region.repository.js findRegionById: " + id);
    const regionInfo = await client.query(
      "SELECT si, gu FROM user_regions WHERE user_id = $1",
      [id]
    );
    return regionInfo.rows;
  } catch (error) {
    logger.error("user.region.repository.js findRegionById: " + error.message);
    throw error;
  }
};

const updateRegionById = async (si, gu, userId) => {
  try {
    logger.info("user.region.repository.js updateRegionById: " + userId + ', ' + si + ', ' + gu);
    await client.query(
      "UPDATE user_regions SET si = $1, gu = $2 WHERE user_id = $3",
      [si, gu, userId]  
    );
  } catch (error) {
    logger.error("user.region.repository.js updateRegionById: " + error.message);
    throw error;
  }
};

const saveRegionById = async (si, gu, id) => {
  try {
    logger.info("user.region.repository.js saveRegionById: " + id + ', ' + si + ', ' + gu);
    await client.query(
      `INSERT INTO user_regions (
                user_id,
                si,
                gu,
                updated_at
            ) VALUES ($1, $2, $3, now())
            `,
      [id, si, gu]
    );
  } catch (error) {
    logger.error("user.region.repository.js saveRegionById: " + error.message);
    throw error;
  }
};

module.exports = {
  findRegionById,
  updateRegionById,
  saveRegionById,
};

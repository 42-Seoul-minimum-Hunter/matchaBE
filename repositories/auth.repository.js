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

const findAuthInfoById = async (id) => {
  try {
    logger.info("auth.repository.js findAuthInfoById: " + id);
    const result = await client.query(
      `
            SELECT * FROM auth
            WHERE user_id = $1
            `,
      [id]
    );

    return result.rows[0];
  } catch (error) {
    logger.error("auth.repository.js findAuthInfoById error: " + error.message);
    throw error;
  }
};

const saveAuthInfoById = async (id, isGpsAllowed, isOauth) => {
  try {
    logger.info(
      "auth.repository.js saveAuthInfoById: " +
        id +
        ", " +
        isGpsAllowed +
        ", " +
        isOauth
    );

    await client.query(
      `
            INSERT INTO auth (id, user_id, is_oauth, is_valid, is_gps_allowed, is_twofa, updated_at)
            VALUES ($1, $1, $2, $3, $4, $5, now())
            `,
      [id, isOauth, false, isGpsAllowed, false]
    );
  } catch (error) {
    logger.error("auth.repository.js saveAuthInfoById error: " + error.message);
    throw error;
  }
};

const updateAuthInfoById = async (id, isGpsAllowed, isOauth) => {
  try {
    logger.info(
      "auth.repository.js updateAuthInfoById: " +
        id +
        ", " +
        isGpsAllowed +
        ", " +
        isOauth
    );

    await client.query(
      `
            UPDATE auth
            SET is_oauth = $2, is_gps_allowed = $3, updated_at = now()
            WHERE user_id = $1
            `,
      [id, isOauth, isGpsAllowed]
    );
  } catch (error) {
    logger.error(
      "auth.repository.js updateAuthInfoById error: " + error.message
    );
    throw error;
  }
};

const updateUserValidById = async (id) => {
  try {
    logger.info("auth.repository.js updateUserValidById: " + id);

    await client.query(
      `
            UPDATE auth
            SET is_valid = true, updated_at = now()
            WHERE user_id = $1
            `,
      [id]
    );
  } catch (error) {
    logger.error(
      "auth.repository.js updateUserValidById error: " + error.message
    );
    throw error;
  }
};

const updateGpsAllowedById = async (id, isGpsAllowed) => {
  try {
    logger.info(
      "auth.repository.js updateGpsAllowedById: " + id + ", " + isGpsAllowed
    );

    await client.query(
      `
            UPDATE auth
            SET is_gps_allowed = $2, updated_at = now()
            WHERE user_id = $1
            `,
      [id, isGpsAllowed]
    );
  } catch (error) {
    logger.error(
      "auth.repository.js updateGpsAllowedById error: " + error.message
    );
    throw error;
  }
};

const updateTwoFactorById = async (id, isTwofa) => {
  try {
    logger.info(
      "auth.repository.js updateTwoFactorById: " + id + ", " + isTwofa
    );

    await client.query(
      `
            UPDATE auth
            SET is_twofa = $2, updated_at = now()
            WHERE user_id = $1
            `,
      [id, isTwofa]
    );
  } catch (error) {
    logger.error(
      "auth.repository.js updateTwoFactorById error: " + error.message
    );
    throw error;
  }
};

module.exports = {
  findAuthInfoById,
  saveAuthInfoById,
  updateUserValidById,
  updateGpsAllowedById,
  updateTwoFactorById,
};

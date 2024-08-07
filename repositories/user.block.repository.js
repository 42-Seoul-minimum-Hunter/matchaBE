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

const addBlockUser = async (blockedUserId, userId) => {
  try {
    logger.info(
      "user.block.repository.js addBlockUser: " + blockedUserId + ", " + userId
    );
    const existingBlockHistory = await client.query(
      `
            SELECT * 
            FROM user_block_histories
            WHERE user_id = $1 AND blocked_id = $2 AND deleted_at IS NULL
        `,
      [userId, blockedUserId]
    );

    if (existingBlockHistory.rows.length > 0) {
      const err = new Error("User already blocked.");
      err.statusCode = 400;
      throw err;
    }

    await client.query(
      `
            INSERT INTO user_block_histories (
                user_id,
                blocked_id,
                created_at
            ) VALUES (
                $1,
                $2,
                now()
            )
        `,
      [userId, blockedUserId]
    );
  } catch (error) {
    logger.error("user.block.repository.js addBlockUser: " + error.message);
    throw error;
  }
};

const deleteBlockUser = async (blockedUserId, userId) => {
  try {
    logger.info(
      "user.block.repository.js deleteBlockUser: " +
        blockedUserId +
        ", " +
        userId
    );
    const existingBlockHistory = await client.query(
      `
            SELECT * 
            FROM user_block_histories
            WHERE user_id = $1 AND blocked_id = $2 AND deleted_at IS NULL
        `,
      [userId, blockedUserId]
    );

    if (existingBlockHistory.rows.length === 0) {
      const err = new Error("User not blocked.");
      err.statusCode = 400;
      throw err;
    }

    await client.query(
      `
            UPDATE user_block_histories
            SET deleted_at = now()
            WHERE user_id = $1 AND blocked_id = $2
        `,
      [userId, blockedUserId]
    );
  } catch (error) {
    logger.error("user.block.repository.js deleteBlockUser: " + error.message);
    throw error;
  }
};

const filterBlockedUser = async (id, userInfos) => {
  try {
    logger.info(
      "user.block.repository.js filterBlockedUser: " +
        id +
        ", " +
        JSON.stringify(userInfos)
    );
    //logger.info("user.block.repository.js filterBlockedUser: " + id);
    const blockedUserInfos = await client.query(
      "SELECT blocked_id FROM user_block_histories WHERE user_id = $1 AND deleted_at IS NULL",
      [id]
    );
    const blockedIds = blockedUserInfos.rows.map((row) => row.blocked_id);

    return userInfos.filter(
      (userInfo) =>
        userInfo &&
        userInfo.id !== undefined &&
        !blockedIds.includes(userInfo.id)
    );
  } catch (error) {
    logger.error(
      "user.block.repository.js filterBlockedUser: " + error.message
    );
    throw error;
  }
};

const getBlockRelationByid = async (userId, blockedUserId) => {
  try {
    logger.info(
      "user.block.repository.js getBlockRelationByid: " +
        userId +
        ", " +
        blockedUserId
    );
    const blockRelation = await client.query(
      `
            SELECT * 
            FROM user_block_histories
            WHERE user_id = $1 AND blocked_id = $2
        `,
      [userId, blockedUserId]
    );

    return blockRelation.rows[0];
  } catch (error) {
    logger.error(
      "user.block.repository.js getBlockRelationByid: " + error.message
    );
    throw error;
  }
};

module.exports = {
  addBlockUser,
  deleteBlockUser,
  filterBlockedUser,
  getBlockRelationByid,
};

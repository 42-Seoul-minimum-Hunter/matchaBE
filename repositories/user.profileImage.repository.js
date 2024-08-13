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

const saveProfileImagesById = async (profileImages, userId) => {
  try {
    logger.info(
      "user.profileImage.repository.js saveProfileImagesById: " + userId
    );

    const result = await client.query(
      `INSERT INTO user_profile_images (
                user_id,
                profile_images,
                updated_at
            ) VALUES ($1, $2, now())
             RETURNING profile_images`,
      [userId, profileImages]
    );
  } catch (error) {
    logger.error(
      "user.profileImage.repository.js saveProfileImagesById: " + error
    );
    throw error;
  }
};

const updateProfileImagesById = async (profileImages, userId) => {
  try {
    logger.info(
      "user.profileImage.repository.js updateProfileImagesById: " +
        profileImages +
        ", " +
        userId
    );

    await client.query(
      `UPDATE user_profile_images
            SET profile_images = $1
            WHERE user_id = $2`,
      [profileImages, userId]
    );
  } catch (error) {
    logger.error(
      "user.profileImage.repository.js updateProfileImagesById: " + error
    );
    throw error;
  }
};

const findProfileImagesById = async (id) => {
  try {
    const profileImageInfo = await client.query(
      "SELECT profile_images FROM user_profile_images WHERE user_id = $1",
      [id]
    );
    const decodedProfileImages = profileImageInfo.rows.map((row) =>
      row.profile_images.map((image) => {
        return Buffer.from(image, "base64").toString("utf-8");
      })
    );
    return decodedProfileImages;
  } catch (error) {
    logger.error(
      "user.profileImage.repository.js findProfileImagesById: " + error
    );
    throw error;
  }
};

module.exports = {
  updateProfileImagesById,
  saveProfileImagesById,
  findProfileImagesById,
};

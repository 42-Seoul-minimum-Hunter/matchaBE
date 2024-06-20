const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

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
        const encodedProfileImages = UserCreateDto.profileImages.map((image) => {
            return Buffer.from(image).toString('base64');
        });

        await client.query(
            `INSERT INTO user_profile_images (
                user_id,
                profile_images,
                updated_at
            ) VALUES ($1, $2, now())`,
            [
                userId,
                encodedProfileImages,
            ]
        );
    } catch (error) {
        console.log(error);
        throw error;
    }
};


const updateProfileImagesById = async (profileImages, userId) => {
    try {

        const encodedProfileImages = profileImages.map((image) => {
            return Buffer.from(image).toString('base64');
        });

        await client.query(
            `UPDATE user_profile_images
            SET profile_images = $1
            WHERE user_id = $2`,
            [encodedProfileImages, userId]
        );

    } catch (error) {
        console.log(error);
        throw error;
    }
};

const findProfileImagesById = async (id) => {
    try {
        const profileImageInfo = await client.query('SELECT profile_images FROM user_profile_images WHERE user_id = $1', [id]);
        return profileImageInfo.rows.map((row) => row.profile_images);
    } catch (error) {
        console.log(error);
        throw error;
    }
}



module.exports = {
    updateProfileImagesById,
    saveProfileImagesById,
    findProfileImagesById
};

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

const findUserByUsername = async (username, user_id) => {
    try {
        const userInfo = await client.query('SELECT * FROM users WHERE username = $1', [username]);

        if (userInfo.rows.length === 0) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        } else if (userInfo.rows[0].deleted_at !== null) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        const hashtagInfo = await client.query('SELECT hashtags FROM user_hashtags WHERE user_id = $1', [userInfo.rows[0].id]);
        const hashtags = hashtagInfo.rows.map(row => row.hashtags);


        const profileImageInfo = await client.query('SELECT profile_images FROM user_profile_images WHERE user_id = $1', [userInfo.rows[0].id]);
        const profileImages = profileImageInfo.rows.map((row) => row.profile_images);


        const regionInfo = await client.query('SELECT si, gu FROM user_regions WHERE user_id = $1', [userInfo.rows[0].id]);


        const ratingInfo = await client.query('SELECT rate_score FROM user_ratings WHERE rated_id = $1', [userInfo.rows[0].id]);
        let rate;
        if (ratingInfo.rows.length === 0) {
            rate = parseFloat(0);
        } else {
            //average
            const ratingScores = ratingInfo.rows.map(row => row.rate_score);
            const totalScore = ratingScores.reduce((acc, score) => acc + score, 0);
            rate = totalScore / ratingInfo.rows.length;
        }

        const blockInfo = await client.query('SELECT * FROM user_block_histories WHERE user_id = $1 AND blocked_id = $2', [user_id, userInfo.rows[0].id]);
        const blocked = blockInfo.rows.length !== 0; // true or false


        const user = {
            username: userInfo.rows[0].username,
            lastName: userInfo.rows[0].last_name,
            firstName: userInfo.rows[0].first_name,
            gender: userInfo.rows[0].gender,
            preference: userInfo.rows[0].preference,
            biography: userInfo.rows[0].biography,
            age: userInfo.rows[0].age,

            hashtags: hashtags,
            profileImages: profileImages,
            region: regionInfo.rows,
            rate: rate,
            blocked: blocked,
        }


        return user;
    } catch (error) {
        return { error: error.message };
    }
}


module.exports = {
    findUserByUsername
};

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

const findUserByUsername = async (username, userId) => {
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

        const blockInfo = await client.query('SELECT * FROM user_block_histories WHERE user_id = $1 AND blocked_id = $2', [userId, userInfo.rows[0].id]);
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

const getMyInfo = async (userId) => {
    try {
        const userInfo = await client.query('SELECT * FROM users WHERE id = $1', [userId]);

        if (userInfo.rows.length === 0) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        } else if (userInfo.rows[0].deleted_at !== null) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        const hashtagInfo = await client.query('SELECT hashtags FROM user_hashtags WHERE user_id = $1', [userId]);
        const hashtags = hashtagInfo.rows.map(row => row.hashtags);


        const profileImageInfo = await client.query('SELECT profile_images FROM user_profile_images WHERE user_id = $1', [userId]);
        const profileImages = profileImageInfo.rows.map((row) => row.profile_images);


        const regionInfo = await client.query('SELECT si, gu FROM user_regions WHERE user_id = $1', [userId]);


        const ratingInfo = await client.query('SELECT rate_score FROM user_ratings WHERE rated_id = $1', [userId]);
        let rate;
        if (ratingInfo.rows.length === 0) {
            rate = parseFloat(0);
        } else {
            //average
            const ratingScores = ratingInfo.rows.map(row => row.rate_score);
            const totalScore = ratingScores.reduce((acc, score) => acc + score, 0);
            rate = totalScore / ratingInfo.rows.length;
        }

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
        }

        console.log(user);

        return user;
    } catch (error) {
        return { error: error.message };
    }
}

const updateUser = async (UserUpdateDto) => {
    try {
        const {
            id,
            email,
            password,
            lastName,
            firstName,
            gender,
            preference,
            biography,
            age,
            gpsAllowedAt,
            isOauth,
        } = UserUpdateDto;

        if (isOauth && email) {
            const error = new Error('Oauth 사용자는 이메일을 변경할 수 없습니다.');
            error.statusCode = 400;
            throw error;
        }

        const existingUser = await client.query(`
            SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL
        `, [id]);

        if (existingUser.rows.length === 0) {
            const error = new Error('사용자를 찾을 수 없습니다.');
            error.statusCode = 400;
            throw error;
        }


        await client.query(`
            UPDATE users
            SET email = $1,
                password = $2,
                last_name = $3,
                first_name = $4,
                gender = $5,
                preference = $6,
                biography = $7,
                age = $8,
                gps_allowed_at = $9
            WHERE id = $10
            RETURNING *
        `, [
            email,
            password,
            lastName,
            firstName,
            gender,
            preference,
            biography,
            age,
            gpsAllowedAt,
            id
        ]);

    } catch (error) {
        console.log(error);
        throw error;
    }
}


const updateHashtags = async (hashtags, user_id) => {
    try {
        const result = await client.query(
            `UPDATE user_hashtags uh
             SET hashtags = $1, updated_at = now()
             WHERE uh.user_id = $2 AND EXISTS (
                 SELECT 1 
                 FROM users u
                 WHERE u.id = uh.user_id 
                   AND u.deleted_at IS NOT NULL
             )
             RETURNING *`,
            [
                hashtags,
                user_id
            ]
        );
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const updateRegion = async (region, user_id) => {
    try {
        const result = await client.query(
            `UPDATE user_regions ur
             SET si = $1, gu = $2, updated_at = now()
             WHERE ur.user_id = $3 AND EXISTS (
                 SELECT 1
                 FROM users u
                 WHERE u.id = ur.user_id
                   AND u.deleted_at IS NULL
             )
             RETURNING *`,
            [
                region.si,
                region.gu,
                user_id
            ]
        );
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const updateProfileImages = async (profileImages, user_id) => {
    try {
        if (profileImages.length > 5) {
            const error = new Error('프로필 이미지는 최대 5개까지만 등록할 수 있습니다.');
            error.statusCode = 400;
            throw error;
        }

        const encodedProfileImages = profileImages.map((image) => {
            return Buffer.from(image).toString('base64');
        });

        const result = await client.query(
            `UPDATE user_profile_images upi
             SET profile_images = $1, updated_at = now()
             WHERE upi.user_id = $2 AND EXISTS (
                 SELECT 1
                 FROM users u
                 WHERE u.id = upi.user_id
                   AND u.deleted_at IS NULL
             )
             RETURNING *`,
            [
                encodedProfileImages,
                user_id
            ]
        );
    } catch (error) {
        console.log(error);
        throw error;
    }
};

const findProfileImagesById = async (id) => {
    try {
        const profileImageInfo = await client.query('SELECT profile_images FROM user_profile_images WHERE user_id = $1', [id]);

        if (profileImageInfo.rows.length === 0) {
            const error = new Error('프로필 이미지를 찾을 수 없습니다.');
            error.statusCode = 404;
            throw error;
        }

        return profileImageInfo.rows.map((row) => row.profile_images);
    } catch (error) {
        console.log(error);
        throw error;
    }
}



module.exports = {
    findUserByUsername,
    getMyInfo,
    updateUser,
    updateHashtags,
    updateRegion,
    updateProfileImages,

    findProfileImagesById
};

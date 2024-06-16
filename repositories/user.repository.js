const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const UserCreateDto = require('../dtos/user.create.dto');

client.connect();

const createUser = async (UserCreateDto) => {
    try {
        const {
            email,
            username,
            password,
            lastName,
            firstName,
            gender,
            preference,
            biography,
            age,
            gpsAllowedAt,
        } = UserCreateDto;

        const result = await client.query(
            `INSERT INTO users (
                email,
                username,
                password,
                last_name,
                first_name,
                gender,
                preference,
                biography,
                age,
                is_oauth,
                is_valid,
                gps_allowed_at,
                connected_at,
                created_at,
                deleted_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, now(), now(), null)
            RETURNING *`,
            [
                email,
                username,
                password,
                lastName,
                firstName,
                gender,
                preference,
                biography,
                age,
                false,
                false,
                gpsAllowedAt,
            ]
        )

        return result.rows[0].id;
    } catch (error) {
        return { error: error.message };
    }
}

const saveHashtag = async (hashtags, user_id) => {
    try {
        const result = await client.query(
            `INSERT INTO user_hashtags (
                user_id,
                hashtags,
                updated_at
            ) VALUES ($1, $2, now())
            RETURNING *`,
            [
                user_id,
                hashtags,
            ]
        )
    } catch (error) {
        return { error: error.message };
    }
}

const saveRegion = async (region, user_id) => {
    try {

        const result = await client.query(
            `INSERT INTO user_regions (
                user_id,
                si,
                gu,
                dong,
                updated_at
            ) VALUES ($1, $2, $3, $4, now())
            RETURNING *`,
            [
                user_id,
                region.si,
                region.gu,
                region.dong,
            ]
        )
    } catch (error) {
        return { error: error.message };
    }
}

const saveProfileImages = async (profileImages, user_id) => {
    try {

        const result = await client.query(
            `INSERT INTO user_profile_images (
                user_id,
                profile_images,
                updated_at
            ) VALUES ($1, $2, now())
            RETURNING *`,
            [
                user_id,
                profileImages,
            ]
        )
    } catch (error) {
        return { error: error.message };
    }
}

const deleteUser = async (id) => {
    try {
        // 해당 유저가 이미 삭제되었는지 확인
        const existingUser = await client.query(
            `SELECT * FROM users WHERE id = $1 AND deleted_at IS NOT NULL`,
            [id]
        );

        if (existingUser.rows.length > 0) {
            return { error: new Error('이미 삭제된 사용자입니다.') };
        }

        // 유저 삭제 처리
        const result = await client.query(
            `UPDATE users 
             SET deleted_at = now()
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return { error: new Error('사용자를 삭제할 수 없습니다.') };
        }
    }
    catch (error) {
        console.log("repository");
        return { error: error };
    }
}



module.exports = {
    createUser,
    saveHashtag,
    saveRegion,
    saveProfileImages,

    deleteUser
};

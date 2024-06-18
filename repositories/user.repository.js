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

        // username과 email 중복 확인
        const existingUser = await client.query(
            `SELECT * FROM users WHERE username = $1 OR email = $2`,
            [username, email]
        );
        if (existingUser.rows.length > 0) {
            const error = new Error('Username or email already exists');
            error.statusCode = 409;
            throw error;
        }

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
                deleted_at,
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, now(), now(), null, now())
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
        console.log(error);
        throw error;
    }
}

const saveHashtags = async (hashtags, user_id) => {
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
        console.log(error);
        throw error;
    }
}

const saveRegion = async (region, user_id) => {
    try {

        const result = await client.query(
            `INSERT INTO user_regions (
                user_id,
                si,
                gu,
                updated_at
            ) VALUES ($1, $2, $3, now())
            RETURNING *`,
            [
                user_id,
                region.si,
                region.gu,
            ]
        )
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const saveProfileImages = async (profileImages, user_id) => {
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
            `INSERT INTO user_profile_images (
                user_id,
                profile_images,
                updated_at
            ) VALUES ($1, $2, now())
            RETURNING *`,
            [
                user_id,
                encodedProfileImages,
            ]
        );
    } catch (error) {
        console.log(error);
        throw error;
    }
};

const deleteUser = async (id) => {
    try {
        // 해당 유저가 이미 삭제되었는지 확인
        const existingUser = await client.query(
            `SELECT * FROM users WHERE id = $1 AND deleted_at IS NOT NULL`,
            [id]
        );

        if (existingUser.rows.length > 0) {
            const error = new Error('이미 삭제된 사용자입니다.');
            error.statusCode = 400;
            throw error;
        }

        // 유저 삭제 처리
        const result = await client.query(
            `UPDATE users 
             SET deleted_at = now(), updated_at = now()
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            const error = new Error('사용자를 삭제할 수 없습니다.')
            error.statusCode = 400;
            throw error;
        }
    }
    catch (error) {
        console.log(error);
        throw error;
    }
}

const changePassword = async (hashedPassword, id) => {
    try {
        console.log(hashedPassword)
        const result = await client.query(
            `UPDATE users
             SET password = $1, updated_at = now()
             WHERE id = $2 AND deleted_at IS NULL
             RETURNING *`,
            [hashedPassword, 22]
        );

        if (result.rows.length === 0) {
            const error = new Error('비밀번호를 변경할 수 없습니다.');
            error.statusCode = 400;
            throw error;
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

//TODO: 쿼리 안나오는 문제 해결
const findUserByUsername = async (filter) => {
    try {
        console.log(filter)
        let query = `
            SELECT u.*
            FROM users u
            `

        let params = [];

        if (filter.minRate || filter.maxRate) {
            query += `JOIN user_ratings ur ON u.id = ur.user_id`;
        }

        if (filter.hashtags) {
            query += `JOIN user_hashtags uh ON u.id = uh.user_id`;
        }

        if (filter.minRate) {
            query += ` AND ur.rate_score >= $${params.length + 1}`;
            params.push(filter.minRate);
        }

        if (filter.maxRate) {
            query += ` AND ur.rate_score <= $${params.length + 1}`;
            params.push(filter.maxRate);
        }

        if (filter.hashtags) {
            query += ` AND $${params.length + 1} <@ uh.hashtags`;
            params.push(filter.hashtags);
        }

        if (filter.username) {
            query += `WHERE u.username = $${params.length + 1}`;
            params.push(filter.username);
        }


        if (filter.minAge) {
            query += ` AND u.age >= $${params.length + 1}`;
            params.push(filter.minAge);
        }

        if (filter.maxAge) {
            query += ` AND u.age <= $${params.length + 1}`;
            params.push(filter.maxAge);
        }


        console.log(query);
        console.log(params);

        const userInfos = await client.query(query, params);

        return userInfos.rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

const updateUser = async (UserUpdateDto, user_id) => {
    try {
        const {
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
        `, [user_id]);

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
            user_id
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



module.exports = {
    createUser,
    saveHashtags,
    saveRegion,
    saveProfileImages,

    deleteUser,

    changePassword,

    findUserByUsername,

    updateUser,
    updateHashtags,
    updateRegion,
    updateProfileImages
};

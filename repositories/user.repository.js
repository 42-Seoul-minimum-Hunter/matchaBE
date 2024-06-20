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

const createUser = async (req, UserCreateDto) => {
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

        let isOauth = false;

        if (req.jwtInfo && req.jwtInfo.isOauth && req.jwtInfo.accessToken) {
            isOauth = true;
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
                isOauth,
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

const saveHashtags = async (hashtags, userId) => {
    try {
        const result = await client.query(
            `INSERT INTO user_hashtags (
                user_id,
                hashtags,
                updated_at
            ) VALUES ($1, $2, now())
            RETURNING *`,
            [
                userId,
                hashtags,
            ]
        )
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const saveRegion = async (region, userId) => {
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
                userId,
                region.si,
                region.gu,
            ]
        )
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const saveProfileImages = async (UserCreateDto, userId) => {
    try {
        const encodedProfileImages = UserCreateDto.profileImages.map((image) => {
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
                userId,
                encodedProfileImages,
            ]
        );

        return userId;

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

const changePassword = async (hashedPassword, email) => {
    try {
        //console.log(hashedPassword)
        const result = await client.query(
            `UPDATE users
             SET password = $1, updated_at = now()
             WHERE email = $2 AND deleted_at IS NULL
             RETURNING *`,
            [hashedPassword, email]
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

const findUserByFilter = async (filter) => {
    try {
        //console.log(filter)

        var {
            hashtags,
            username,
            minAge,
            maxAge,
            minRate,
            maxRate,
            si,
            gu
        } = filter;

        let query = 'SELECT u.* FROM users u';
        const params = [];

        // hashtags 조건 추가
        if (hashtags) {
            query += ' JOIN user_hashtags uh ON u.id = uh.user_id';
        }

        if (si) {
            query += ' JOIN user_regions ur ON u.id = ur.user_id'
        }

        if (hashtags) {
            query += ' WHERE $1 <@ uh.hashtags';
            params.push(hashtags);
        }

        // si, gu 조건 추가
        if (si) {
            query += ' AND ur.si = $' + (params.length + 1);
            params.push(si);

            if (gu) {
                query += ' AND ur.gu = $' + (params.length + 1);
                params.push(gu);
            }
        }

        // username 조건 추가
        if (username) {
            if (hashtags || si) {
                query += ' AND u.username LIKE $' + (params.length + 1);
            } else {
                query += ' WHERE u.username LIKE $' + (params.length + 1);
            }
            params.push(`%${username}%`);
        }

        // minAge, maxAge 조건 추가
        if (minAge) {
            query += ' AND u.age >= $' + (params.length + 1);
            params.push(minAge);
        }
        if (maxAge) {
            query += ' AND u.age <= $' + (params.length + 1);
            params.push(maxAge);
        }

        if (!minRate) {
            minRate = parseFloat(0);
        }

        if (!maxRate) {
            maxRate = parseFloat(5);
        }

        const userInfos = await client.query(query, params);


        // 사용자 평균 평점 계산 및 필터링
        const filteredUserInfos = [];
        for (const userInfo of userInfos.rows) {
            const ratingInfo = await client.query('SELECT rate_score FROM user_ratings WHERE rated_id = $1', [userInfo.id]);
            let rate;
            if (ratingInfo.rows.length === 0) {
                rate = parseFloat(0);
                console.log('rate: ' + rate)
            } else {
                const ratingScores = ratingInfo.rows.map(row => row.rate_score);
                const totalScore = ratingScores.reduce((acc, score) => acc + score, 0);
                rate = totalScore / ratingInfo.rows.length;
            }

            if (rate >= minRate && rate <= maxRate) {
                userInfo.rate = rate;
                filteredUserInfos.push(userInfo);
            }
        }

        //console.log('infologs: ' + filteredUserInfos);

        const UserInfo = await Promise.all(filteredUserInfos.sort((a, b) => {
            if (a.connected_at < b.connected_at) return -1;
            if (a.connected_at > b.connected_at) return 1;
            return 0;
        }).map(async (userInfo) => {
            const { rows } = await client.query('SELECT profile_images FROM user_profile_images WHERE user_id = $1', [userInfo.id]);
            const profileImages = rows.length > 0 ? rows[0].profile_images : null;

            return {
                username: userInfo.username,
                age: userInfo.age,
                profileImages: profileImages[0],
                rate: userInfo.rate,
            }
        }));

        return UserInfo;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

const findUserByUsername = async (username) => {
    try {
        const { rows } = await client.query('SELECT * FROM users WHERE username = $1 AND deleted_at IS NULL', [username]);
        if (rows.length === 0) {
            return null;
        }

        return rows[0];
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const findUserByEmail = async (email) => {
    try {
        const { rows } = await client.query('SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL', [email]);
        if (rows.length === 0) {
            const error = new Error('사용자를 찾을 수 없습니다.');
            error.statusCode = 404;
            throw error;
        }

        return rows[0];
    } catch (error) {
        console.log(error);
        throw error;
    }
}


module.exports = {
    createUser,
    saveHashtags,
    saveRegion,
    saveProfileImages,

    deleteUser,

    changePassword,

    findUserByFilter,

    findUserByUsername,
    findUserByEmail
};

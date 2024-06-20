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

const addLikeUserByUsername = async (likeUserId, userId) => {
    try {
        const existingLikeHistory = await client.query(`
            SELECT * 
            FROM user_like_histories
            WHERE user_id = $1 AND liked_id = $2 AND deleted_at IS NULL
        `, [userId, likeUserId]);

        if (existingLikeHistory.rows.length > 0) {
            throw new Error('이미 좋아요한 사용자입니다.');
        }

        await client.query(`
            INSERT INTO user_like_histories (
                user_id,
                liked_id,
                created_at
            ) VALUES (
                $1,
                $2,
                now()
            )
        `, [userId, likeUserId]);


    } catch (error) {
        console.log(error.message);
        throw error;
    }
};

const deleteLikeUserByUsername = async (likeUserId, userId) => {
    try {
        const existingLikeHistory = await client.query(`
            SELECT * 
            FROM user_like_histories
            WHERE user_id = $1 AND liked_id = $2 AND deleted_at NOT NULL
        `, [userId, likeUserId]);

        if (existingLikeHistory.rows.length === 0) {
            throw new Error('차단 기록이 존재하지 않습니다.');
        }

        await client.query(`
            UPDATE user_like_histories
            SET deleted_at = NULL
            WHERE user_id = $1 AND liked_id = $2
        `, [userId, likeUserId]);

    } catch (error) {
        console.log(error.message);
        throw error;
    }

};

const getLikeUserHistoriesById = async (id) => {
    try {
        const likeUserHistories = await client.query(`
            SELECT * 
            FROM user_like_histories
            WHERE user_id = $1 AND deleted_at IS NULL
        `, [id]);

        return likeUserHistories.rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const updateLikeUserHistoriesById = async (id) => {
    try {
        await client.query(`
            UPDATE user_like_histories
            SET viewed_at = now()
            WHERE liked_id = $1 AND viewed_at IS NULL
        `, [id]);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports = {
    addLikeUserByUsername,
    deleteLikeUserByUsername,

    getLikeUserHistoriesById,
    updateLikeUserHistoriesById
}

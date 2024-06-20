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

const addBlockUser = async (blockUsername, userId) => {
    try {

        const existingBlockHistory = await client.query(`
            SELECT * 
            FROM user_block_histories
            WHERE user_id = $1 AND block_id = (
                SELECT id
                FROM users
                WHERE username = $2
            ) AND deleted_at IS NULL
        `, [userId, blockUsername]);

        if (existingBlockHistory.rows.length > 0) {
            throw new Error('이미 차단한 사용자입니다.');
        }

        await client.query(`
            INSERT INTO user_block_histories (
                user_id,
                block_id,
                blocked_at
            ) VALUES (
                $1,
                (
                    SELECT id
                    FROM users
                    WHERE username = $2
                ),
                now()
            )
        `, [userId, blockUsername]);

    } catch (error) {
        console.log(error);
        throw error;
    }
};

const deleteBlockUser = async (blockUsername, userId) => {
    try {

        const existingBlockHistory = await client.query(`
            SELECT * 
            FROM user_block_histories
            WHERE user_id = $1 AND block_id = (
                SELECT id
                FROM users
                WHERE username = $2
            ) AND deleted_at NOT NULL
        `, [userId, blockUsername]);

        if (existingBlockHistory.rows.length === 0) {
            throw new Error('차단 기록이 존재하지 않습니다.');
        }

        await client.query(`
            UPDATE user_block_histories
            SET deleted_at = NULL
            WHERE user_id = $1 AND block_id = (
                SELECT id
                FROM users
                WHERE username = $2
            )
        `, [userId, blockUsername]);
    } catch (error) {
        console.log(error);
        throw error;
    }
}


module.exports = {
    addBlockUser,
    deleteBlockUser
}

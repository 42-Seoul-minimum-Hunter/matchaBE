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

const addBlockUser = async (blockedUserId, userId) => {
    try {

        const existingBlockHistory = await client.query(`
            SELECT * 
            FROM user_block_histories
            WHERE user_id = $1 AND block_id = $2 AND deleted_at NOT NULL
        `, [userId, blockedUserId]);

        if (existingBlockHistory.rows.length > 0) {
            const Error = new Error('User already blocked.');
            Error.statusCode = 400;
            throw Error;
        }

        await client.query(`
            INSERT INTO user_block_histories (
                user_id,
                block_id,
                created_at
            ) VALUES (
                $1,
                $2,
                now()
            )
        `, [userId, blockedUserId]);

    } catch (error) {
        console.log(error);
        throw error;
    }
};

const deleteBlockUser = async (blockedUserId, userId) => {
    try {

        const existingBlockHistory = await client.query(`
            SELECT * 
            FROM user_block_histories
            WHERE user_id = $1 AND block_id = $2 AND deleted_at IS NULL
        `, [userId, blockedUserId]);

        if (existingBlockHistory.rows.length === 0) {
            const Error = new Error('User not blocked.');
            Error.statusCode = 400;
            throw Error;
        }

        await client.query(`
            UPDATE user_block_histories
            SET deleted_at = NULL
            WHERE user_id = $1 AND block_id = $2
        `, [userId, blockedUserId]);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const filterBlockedUser = async (userId, userInfos) => {
    try {
        const blockedUserInfos = await client.query('SELECT blocked_id FROM user_block_histories WHERE user_id = $1', [userId]);
        const blockedIds = blockedUserInfos.rows.map(row => row.blocked_id);

        return userInfos.filter(userInfo => !blockedIds.includes(userInfo.id));
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const getBlockRelationByid = async (userId, blockedUserId) => {
    try {
        const blockRelation = await client.query(`
            SELECT * 
            FROM user_block_histories
            WHERE user_id = $1 AND block_id = $2
        `, [userId, blockedUserId]);

        return blockRelation.rows[0];
    } catch (error) {
        console.log(error);
        throw error;
    }
}


module.exports = {
    addBlockUser,
    deleteBlockUser,
    filterBlockedUser,
    getBlockRelationByid
}

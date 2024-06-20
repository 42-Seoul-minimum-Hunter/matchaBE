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

const getChatInfo = async (userId) => {
    try {

        const chatInfo = await client.query(`
            SELECT 
                uc.id,
                uc.user_id,
                uc.chat_id,
                uc.created_at,
                uc.updated_at,
                c.id as chat_id,
                c.name as chat_name,
                c.description as chat_description,
                c.created_at as chat_created_at,
                c.updated_at as chat_updated_at
            FROM user_chats uc
            LEFT JOIN chats c
            ON uc.chat_id = c.id
            WHERE uc.user_id = $1
        `, [userId]);

        return chatInfo.rows;

    } catch (error) {
        console.log(error);
        throw error;
    }
};

module.exports = {
    getChatInfo
}

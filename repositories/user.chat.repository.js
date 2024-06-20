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

        const chatRoomInfo = await client.query(`
            SELECT * FROM user_chat_histories uch
            FROM user_chat_rooms ucr
            WHERE uch.chat_room_id = ucr.id
            AND (uch.user_id = $1 OR uch.chated_id = $1)
            ORDER BY uch.created_at DESC
            
        `, [userId]);

        const recentChat = await client.query(`
            SELECT * FROM user_chat_rooms 
            WHERE user_id = $1 OR chated_id = $1
            ORDER BY created_at DESC
            LIMIT 1
        `, [chatRoomInfo.rows[0].id]);



        const chatInfo = await client.query(`
            SELECT username FROM users 
        `, [chatRoomInfo.rows[0].id]);

        return chatInfo.rows;

    } catch (error) {
        console.log(error);
        throw error;
    }
};

module.exports = {
    getChatInfo
}

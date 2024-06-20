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
            SELECT * FROM user_chat_rooms 
            WHERE user_id = $1 AND deleted_at IS NULL
            OR chated_id = $1 AND deleted_at IS NULL
        `, [userId]);

        const recentChat = await Promise.all(chatRoomInfo.rows.map(async (room) => {
            const { rows } = await client.query(`
                SELECT * FROM user_chat_messages
                WHERE room_id = $1
                ORDER BY created_at DESC
                LIMIT 1
            `, [room.id]);

            return rows.length > 0 ? rows[0] : null;
        }));

        recentChat.sort((a, b) => {
            if (a && b) {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            } else {
                return 0;
            }
        });

        let chatInfo = {}

        for (const chat of recentChat) {
            if (chat) {
                const chatRoom = chatRoomInfo.rows.find(room => room.id === chat.room_id);
                const otherUserId = chatRoom.user_id === userId ? chatRoom.chated_id : chatRoom.user_id;
                const username = await client.query(`
                    SELECT username
                    FROM users
                    WHERE id = $1
                `, [otherUserId]);

                chatInfo.push({
                    username,
                    content: chat.content,
                    createdAt: chat.created_at
                });
            }
        }

        return chatInfo;

    } catch (error) {
        console.log(error);
        throw error;
    }
};


/*
유저가 좋아요를 누르면
유저 채팅방을 생성한다.

단, 유저가 이미 채팅방을 가지고 있다면
삭제된 채팅방을 복구한다.
*/
const generateChatRoom = async (chatedUsername, userId) => {
    try {
        const existingChatRoom = await client.query(`
            SELECT * 
            FROM user_chat_rooms
            WHERE user_id = $1 AND chated_id = (
                SELECT id
                FROM users
                WHERE username = $2
            ) OR WHERE chated_id = $1 AND user_id = (
                SELECT id
                FROM users
                WHERE username = $2
            )
        `, [userId, chatedUsername]);

        if (existingChatRoom.rows.length > 0) {
            await client.query(`
                UPDATE user_chat_rooms
                SET delted_at = NULL
                WHERE id = $1
                `, [existingChatRoom.rows[0].id]);
            return;
        }

        await client.query(`
            INSERT INTO user_chat_rooms (
                user_id,
                chated_id,
                created_at
            ) VALUES (
                $1,
                (
                    SELECT id
                    FROM users
                    WHERE username = $2
                ),
                now()
            )
        `, [userId, chatedUsername]);

    } catch (error) {
        console.log(error);
        throw error;
    }
}

const deleteChatRoom = async (chatedUsername, userId) => {
    try {
        const existingChatRoom = await client.query(`
            SELECT * 
            FROM user_chat_rooms
            WHERE user_id = $1 AND chated_id = (
                SELECT id
                FROM users
                WHERE username = $2
            ) OR WHERE chated_id = $1 AND user_id = (
                SELECT id
                FROM users
                WHERE username = $2
            )
        `, [userId, chatedUsername]);

        if (existingChatRoom.rows.length === 0) {
            throw new Error('채팅 기록이 존재하지 않습니다.');
        }

        await client.query(`
            UPDATE user_chat_rooms
            SET deleted_at = now()
            WHERE id = $1
        `, [existingChatRoom.rows[0].id]);

    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports = {
    getChatInfo,
    generateChatRoom,
    deleteChatRoom
}

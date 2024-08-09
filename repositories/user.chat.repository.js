const { Client } = require("pg");
const fs = require("fs");
const path = require("path");
const logger = require("../configs/logger.js");

require("dotenv").config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

client.connect();

const findAllChatRooms = async (userId) => {
  try {
    logger.info("user.chat.repository.js findAllChatRooms: " + userId);
    const chatRoomInfo = await client.query(
      `
            SELECT * FROM user_chat_rooms 
            WHERE user_id = $1 AND deleted_at IS NULL
            OR chated_id = $1 AND deleted_at IS NULL
        `,
      [userId]
    );

    return chatRoomInfo.rows;
  } catch (error) {
    logger.error("user.chat.repository.js findAllChatRooms: " + error.message);
    throw error;
  }
};

const getRecentChat = async (roomId) => {
  try {
    logger.info("user.chat.repository.js getRecentChat: " + roomId);
    const recentChat = await client.query(
      `
            SELECT * FROM user_chat_histories
            WHERE room_id = $1
            ORDER BY created_at DESC
            LIMIT 1
        `,
      [roomId]
    );

    return recentChat.rows[0];
  } catch (error) {
    logger.error("user.chat.repository.js getRecentChat: " + error.message);
    throw error;
  }
};

/*
유저가 좋아요를 누르면
유저 채팅방을 생성한다.

단, 유저가 이미 채팅방을 가지고 있다면
삭제된 채팅방을 복구한다.
*/
const generateChatRoom = async (chatUserId, userId) => {
  try {
    logger.info(
      "user.chat.repository.js generateChatRoom: " + chatUserId + ", " + userId
    );
    if (userId >= chatUserId) {
      const temp = userId;
      userId = chatUserId;
      chatUserId = temp;
    }

    const existingChatRoom = await client.query(
      `
            SELECT * 
            FROM user_chat_rooms
            WHERE user_id = $1 AND chated_id = $2
        `,
      [userId, chatUserId]
    );

    console.log(existingChatRoom.rows);

    if (existingChatRoom.rows.length > 0) {
      await client.query(
        `
                UPDATE user_chat_rooms
                SET deleted_at = NULL
                WHERE id = $1
                `,
        [existingChatRoom.rows[0].id]
      );
      return;
    }

    await client.query(
      `
            INSERT INTO user_chat_rooms (
                user_id,
                chated_id,
                created_at
            ) VALUES (
                $1,
                $2,
                now()
            )
        `,
      [userId, chatUserId]
    );
  } catch (error) {
    logger.error("user.chat.repository.js generateChatRoom: " + error.message);
    throw error;
  }
};

const deleteChatRoom = async (chatUserId, userId) => {
  try {
    logger.info(
      "user.chat.repository.js deleteChatRoom: " + chatUserId + ", " + userId
    );
    if (userId >= chatUserId) {
      const temp = userId;
      userId = chatUserId;
      chatUserId = temp;
    }

    const existingChatRoom = await client.query(
      `
            SELECT * 
            FROM user_chat_rooms
            WHERE user_id = $1 AND chated_id = $2
        `,
      [userId, chatUserId]
    );

    if (existingChatRoom.rows.length === 0) {
      const error = new Error("Chat room not found");
      error.status = 404;
      throw error;
    }

    await client.query(
      `
            UPDATE user_chat_rooms
            SET deleted_at = now()
            WHERE id = $1
        `,
      [existingChatRoom.rows[0].id]
    );
  } catch (error) {
    logger.error("user.chat.repository.js deleteChatRoom: " + error.message);
    throw error;
  }
};

const getChatHistoriesForAlarmById = async (id) => {
  try {
    logger.info("user.chat.repository.js getChatHistoriesForAlarmById: " + id);
    const chatRoom = await client.query(
      `
            SELECT *
            FROM user_chat_rooms
            WHERE userid = $1 AND deleted_at IS NULL 
            OR chated_id = $1 AND deleted_at IS NULL
        `,
      [id]
    );

    const chatHistories = await Promise.all(
      chatRoom.rows.map(async (room) => {
        const { rows } = await client.query(
          `
                SELECT *
                FROM user_chat_histories
                WHERE room_id = $1 AND deleted_at IS NULL
                ORDER BY created_at DESC
            `,
          [room.id]
        );

        return rows.length > 0 ? rows[0] : null;
      })
    );

    chatHistories.sort((a, b) => {
      if (a && b) {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } else {
        return 0;
      }
    });

    return chatHistories;
  } catch (error) {
    logger.error(
      "user.chat.repository.js getChatHistoriesForAlarmById: " + error.message
    );
    throw error;
  }
};

const updateChatHistoriesForAlarmById = async (id) => {
  try {
    logger.info(
      "user.chat.repository.js updateChatHistoriesForAlarmById: " + id
    );
    const chatRoom = await client.query(
      `
            SELECT *
            FROM user_chat_rooms
            WHERE userid = $1 AND deleted_at IS NULL 
            OR chated_id = $1 AND deleted_at IS NULL
        `,
      [id]
    );

    await Promise.all(
      chatRoom.rows.map(async (room) => {
        await client.query(
          `
                UPDATE user_chat_histories
                SET viewed_at = now()
                WHERE room_id = $1 AND deleted_at IS NULL
            `,
          [room.id]
        );
      })
    );
  } catch (error) {
    logger.error(
      "user.chat.repository.js updateChatHistoriesForAlarmById: " +
        error.message
    );
    throw error;
  }
};

const getChatHistoriesById = async (roomId) => {
  try {
    logger.info("user.chat.repository.js getChatHistoriesById: " + roomId);
    const chatHistories = await client.query(
      `
            SELECT * 
            FROM user_chat_histories
            WHERE room_id = $1 
            ORDER BY created_at ASC
        `,
      [roomId]
    );

    return chatHistories.rows;
  } catch (error) {
    logger.error(
      "user.chat.repository.js getChatHistoriesById: " + error.message
    );
    throw error;
  }
};

const findOneChatRoomById = async (userId, chatedId) => {
  try {
    logger.info("user.chat.repository.js findOneChatRoomById: " + userId);
    if (userId >= chatedId) {
      const temp = userId;
      userId = chatedId;
      chatedId = temp;
    }

    const chatRoom = await client.query(
      `
        SELECT *
        FROM user_chat_rooms
        WHERE user_id = $1 AND chated_id = $2 AND deleted_at IS NULL
        `,
      [userId, chatedId]
    );

    return chatRoom.rows[0];
  } catch (error) {
    logger.error(
      "user.chat.repository.js findOneChatRoomById: " + error.message
    );
    throw error;
  }
};

const saveSendedChatById = async (roomId, senderId, content) => {
  try {
    logger.info(
      "user.chat.repository.js saveSendedChatById: " +
        roomId +
        ", " +
        senderId +
        ", " +
        content
    );
    await client.query(
      `
      INSERT INTO user_chat_histories (
            room_id,
            sender_id,
            content,
            created_at
        ) VALUES (
            $1,
            $2,
            $3,
            now()
        )
      `,
      [roomId, senderId, content]
    );
  } catch (error) {
    logger.error(
      "user.chat.repository.js saveSendedChatById: " + error.message
    );
    throw error;
  }
};

const checkChatRoomExist = async (userId, chatedId) => {
  try {
    logger.info(
      "user.chat.repository.js checkChatRoomExist: " + userId + ", " + chatedId
    );
    if (userId >= chatedId) {
      const temp = userId;
      userId = chatedId;
      chatedId = temp;
    }

    const chatRoom = await client.query(
      `
        SELECT *
        FROM user_chat_rooms
        WHERE user_id = $1 AND chated_id = $2 AND deleted_at IS NULL
        INTERSECT
        SELECT *
        FROM user_chat_rooms
        WHERE user_id = $2 AND chated_id = $1 AND deleted_at IS NULL
        `,
      [userId, chatedId]
    );

    return chatRoom.rows.length > 0;
  } catch (error) {
    logger.error(
      "user.chat.repository.js checkChatRoomExist: " + error.message
    );
    throw error;
  }
};

module.exports = {
  findAllChatRooms,
  getRecentChat,
  generateChatRoom,
  deleteChatRoom,

  getChatHistoriesForAlarmById,
  updateChatHistoriesForAlarmById,

  getChatHistoriesById,
  findOneChatRoomById,
  saveSendedChatById,

  checkChatRoomExist,
};

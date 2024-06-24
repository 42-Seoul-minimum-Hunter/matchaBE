const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

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
    const chatRoomInfo = await client.query(
      `
            SELECT * FROM user_chat_rooms 
            WHERE user_id = $1 AND deleted_at IS NULL
            OR chated_id = $1 AND deleted_at IS NULL
        `,
      [userId]
    );

    //const recentChat = await Promise.all(
    //  chatRoomInfo.rows.map(async (room) => {
    //    const { rows } = await client.query(
    //      `
    //            SELECT * FROM user_chat_histories
    //            WHERE room_id = $1
    //            ORDER BY created_at DESC
    //            LIMIT 1
    //        `,
    //      [room.id]
    //    );

    //    return rows.length > 0 ? rows[0] : null;
    //  })
    //);

    //if (!recentChat) {
    //  return {
    //    chatRoomInfo: chatRoomInfo.rows,
    //    recentChat: [],
    //  };
    //}

    //const chatInfo = {
    //  chatRoomInfo: chatRoomInfo.rows,
    //};

    return chatRoomInfo.rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getRecentChat = async (roomId) => {
  try {
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
const generateChatRoom = async (chatUserId, userId) => {
  try {
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

    if (existingChatRoom.rows.length > 0) {
      await client.query(
        `
                UPDATE user_chat_rooms
                SET delted_at = NULL AND viewed_at = NULL
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
    console.log(error);
    throw error;
  }
};

const deleteChatRoom = async (chatUserId, userId) => {
  try {
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
    console.log(error);
    throw error;
  }
};

const getChatHistoriesForAlarmById = async (id) => {
  try {
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
    console.log(error);
    throw error;
  }
};

const updateChatHistoriesForAlarmById = async (id) => {
  try {
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
    console.log(error);
    throw error;
  }
};

const getChatHistoriesById = async (roomId) => {
  try {
    const chatHistories = await client.query(
      `
            SELECT * 
            FROM user_chat_histories
            WHERE id = $1 
            ORDER BY created_at DESC
        `,
      [roomId]
    );

    return chatHistories.rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const findOneChatRoomById = async (userId, chatedId) => {
  try {
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
    console.log(error);
    throw error;
  }
};

const saveSendedChatById = async (roomId, senderId, content) => {
  try {
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
            $3
            now()
        )
      `, [roomId, senderId, content]
    )
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  getChatInfo,
  getRecentChat,
  generateChatRoom,
  deleteChatRoom,

  getChatHistoriesForAlarmById,
  updateChatHistoriesForAlarmById,

  getChatHistoriesById,
  findOneChatRoomById,
  saveSendedChatById
};

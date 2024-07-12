const userChatRepository = require("../repositories/user.chat.repository");
const userRepository = require("../repositories/user.repository");
const userLikeRepository = require("../repositories/user.like.repository");
const userProfileImageRepository = require("../repositories/user.profileImage.repository");

const logger = require("../configs/logger");

const findAllChatRooms = async (userId) => {
  try {
    logger.info("user.chat.service.js findAllChatRooms: " + userId);
    const chatRoomInfos = await userChatRepository.findAllChatRooms(userId);
    if (!chatRoomInfos) {
      return null;
    }

    let AllChatRoomInfos = [];

    for (const chat of chatRoomInfos) {
      const recentChat = await userChatRepository.getRecentChat(chat.id);
      const otherUserId =
        chat.user_id !== userId ? chat.user_id : chat.chated_id;
        const userInfo = await userRepository.findUserById(otherUserId);
        const userProfileImage =
        await userProfileImageRepository.findProfileImagesById(otherUserId);
      let userChatInfo;
      if (recentChat) {
        userChatInfo = {
          username: userInfo.username,
          content: recentChat.content,
          createdAt: recentChat.created_at,
          profileImage: userProfileImage[0][0],
        };
      } else {
        userChatInfo = {
          username: userInfo.username,
          content: "No chat history",
          createdAt: chat.created_at,
          profileImage: userProfileImage[0][0],
        };
      }
      console.log("userChatInfo", userChatInfo);
      AllChatRoomInfos.push(userChatInfo);
    }
    return AllChatRoomInfos;
  } catch (error) {
    logger.error("user.chat.service.js findAllChatRooms: " + error.message);
    throw error;
  }
};

const findAllChatHistoriesByRoomId = async (roomId) => {
  try {
    logger.info("user.chat.service.js findAllChatHistoriesByRoomId: " + roomId);
    const chatHistories = await userChatRepository.getChatHistoriesById(roomId);

    return chatHistories;
  } catch (error) {
    logger.error("user.chat.service.js findAllChatHistoriesByRoomId: " + error.message);
    throw error;
  }
};

const findOneChatRoomById = async (userId, chatedId) => {
  try {
    logger.info("user.chat.service.js findOneChatRoomById: " + userId + ", " + chatedId);
    const chatRoom = await userChatRepository.findOneChatRoomById(
      userId,
      chatedId
    );
    
    return chatRoom;
  } catch (error) {
    logger.error("user.chat.service.js findOneChatRoomById: " + error.message);
    throw error;
  }
};

const saveSendedChatById = async (roomId, senderId, content) => {
  try {
    logger.info("user.chat.service.js saveSendedChatById: " + roomId + ", " + senderId + ", " + content);
    return await userChatRepository.saveSendedChatById(roomId, senderId, content);
  } catch (error) {
    logger.error("user.chat.service.js saveSendedChatById: " + error.message);
    throw error;
  }
}

module.exports = {
  findAllChatRooms,
  findAllChatHistoriesByRoomId,
  findOneChatRoomById,

  saveSendedChatById
};

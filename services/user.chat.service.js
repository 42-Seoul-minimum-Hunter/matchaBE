const userChatRepository = require("../repositories/user.chat.repository");
const userRepository = require("../repositories/user.repository");
const userLikeRepository = require("../repositories/user.like.repository");
const userProfileImageRepository = require("../repositories/user.profileImage.repository");

const getChatInfo = async (userId) => {
  try {
    const chatRoomInfos = await userChatRepository.getChatInfo(userId);

    console.log("chatRoomInfos", chatRoomInfos);

    if (!chatRoomInfos) {
      return null;
    }

    let AllChatRoomInfos = [];

    for (const chat of chatRoomInfos) {
      console.log("chat", chat);
      const recentChat = await userChatRepository.getRecentChat(chat.id);
      console.log("recentChat", recentChat);
      console.log("userId", userId);
      const otherUserId =
        chat.user_id !== userId ? chat.user_id : chat.chated_id;
      console.log("otherUserId", otherUserId);
      const userInfo = await userRepository.findUserById(otherUserId);
      console.log("userInfo", userInfo);
      const userProfileImage =
        await userProfileImageRepository.findProfileImagesById(otherUserId);
      console.log("userProfileImage", userProfileImage);
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
          createdAt: null,
          profileImage: userProfileImage[0][0],
        };
      }
      console.log("userChatInfo", userChatInfo);
      AllChatRoomInfos.push(userChatInfo);
    }
    return AllChatRoomInfos;
  } catch (error) {
    return { error: error.message };
  }
};

const getChatHistories = async (userId, username) => {
  try {
    const userInfo = await userRepository.findUserByUsername(username);

    const chatInfo = await userChatRepository.getChatHistoriesById(
      userId,
      userInfo.id
    );

    const userSenderInfo = await userRepository.findUserById(userId);

    const chatAllInfo = {
      roomId: chatInfo.roomId,
      chatHistories: chatInfo.chatHistories,
      userSenderUsername: userSenderInfo.username,
    };

    return chatAllInfo;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  getChatInfo,
  getChatHistories,
};

const userLikeRepository = require("../repositories/user.like.repository");
const userChatRepository = require("../repositories/user.chat.repository");
const userRepository = require("../repositories/user.repository");
const userAlarmRepository = require("../repositories/user.alarm.repository");

const likeUserByUsername = async (likedUsername, userId) => {
  try {
    const likedUserInfo = await userRepository.findUserByUsername(
      likedUsername
    );
    if (!likedUserInfo) {
      const error = new Error("Like user not found.");
      error.status = 404;
      throw error;
    }
    await userLikeRepository.likeUserById(userId, likedUserInfo.id);
    await userAlarmRepository.saveAlarmById(userId, likedUserInfo.id, "LIKED");

    if (await userLikeRepository.checkUserLikeBoth(likedUserInfo.id, userId)) {
      await userChatRepository.generateChatRoom(likedUserInfo.id, userId);
      await userAlarmRepository.saveAlarmById(userId, likedUserInfo.id, "MATCHED");
      await userAlarmRepository.saveAlarmById(likedUserInfo.id, userId, "MATCHED");
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return { error: error.message };
  }
};

const dislikeUserByUsername = async (likedUsername, userId) => {
  try {
    const likedUserInfo = await userRepository.findUserByUsername(
      likedUsername
    );
    if (!likedUserInfo) {
      const error = new Error("Like user not found.");
      error.status = 404;
      throw error;
    }
    await userLikeRepository.dislikeUserByUsername(likedUserInfo.id, userId);
    if (await userChatRepository.checkChatRoomExist(likedUserInfo.id, userId)) {
      await userChatRepository.deleteChatRoom(likedUserInfo.id, userId);
      await userAlarmRepository.saveAlarmById(userId, likedUserInfo.id, "DISLIKED");
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return { error: error.message };
  }
};

const validateLike = async (userId, username) => {
  try {
    const userInfo = await userRepository.findUserByUsername(username);

    if (!userInfo) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const userLikeInfo = await userLikeRepository.checkUserLikeBoth(
      userId,
      userInfo.id
    );

    if (userLikeInfo && userLikeInfo.rows.length == 2) {
      return userLikeInfo.rows;
    } else if (userLikeInfo && userLikeInfo.rows.length == 1) {
      return null;
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  likeUserByUsername,
  dislikeUserByUsername,
  validateLike,
};

const userLikeRepository = require("../repositories/user.like.repository");
const userChatRepository = require("../repositories/user.chat.repository");
const userRepository = require("../repositories/user.repository");
const userAlarmRepository = require("../repositories/user.alarm.repository");

const logger = require("../configs/logger");

const likeUserByUsername = async (likedUsername, userId) => {
  try {
    logger.info(
      "user.like.service.js likeUserByUsername: " +
        likedUsername +
        ", " +
        userId
    );
    const likedUserInfo = await userRepository.findUserByUsername(
      likedUsername
    );
    if (!likedUserInfo) {
      const error = new Error("Like user not found.");
      error.status = 404;
      throw error;
    } else if (likedUserInfo.id === userId) {
      const error = new Error("You can't like yourself.");
      error.status = 400;
      throw error;
    }
    await userLikeRepository.likeUserById(userId, likedUserInfo.id);
    await userAlarmRepository.saveAlarmById(userId, likedUserInfo.id, "LIKED");

    if (await userLikeRepository.checkUserLikeBoth(likedUserInfo.id, userId)) {
      await userChatRepository.generateChatRoom(likedUserInfo.id, userId);
      await userAlarmRepository.saveAlarmById(
        userId,
        likedUserInfo.id,
        "MATCHED"
      );
      await userAlarmRepository.saveAlarmById(
        likedUserInfo.id,
        userId,
        "MATCHED"
      );
      return true;
    } else {
      return false;
    }
  } catch (error) {
    logger.error("user.like.service.js likeUserByUsername: " + error.message);
    throw error;
  }
};

const dislikeUserByUsername = async (likedUsername, userId) => {
  try {
    logger.info(
      "user.like.service.js dislikeUserByUsername: " +
        likedUsername +
        ", " +
        userId
    );
    const likedUserInfo = await userRepository.findUserByUsername(
      likedUsername
    );
    if (!likedUserInfo) {
      const error = new Error("Like user not found.");
      error.status = 404;
      throw error;
    }
    await userLikeRepository.dislikeUserByUsername(likedUserInfo.id, userId);
    await userAlarmRepository.saveAlarmById(
      userId,
      likedUserInfo.id,
      "DISLIKED"
    );
    if (await userChatRepository.checkChatRoomExist(likedUserInfo.id, userId)) {
      await userChatRepository.deleteChatRoom(likedUserInfo.id, userId);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    logger.error(
      "user.like.service.js dislikeUserByUsername: " + error.message
    );
    throw error;
  }
};

const validateLike = async (userId, username) => {
  try {
    logger.info(
      "user.like.service.js validateLike: " + userId + ", " + username
    );
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
    logger.error("user.like.service.js validateLike: " + error.message);
    throw error;
  }
};

module.exports = {
  likeUserByUsername,
  dislikeUserByUsername,
  validateLike,
};

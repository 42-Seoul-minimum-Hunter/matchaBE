const logger = require("../configs/logger");

const userBlockRepository = require("../repositories/user.block.repository");
const userRepository = require("../repositories/user.repository");
const userLikeRepository = require("../repositories/user.like.repository");

const addBlockUser = async (blockedUsername, userId) => {
  try {
    logger.info(
      "user.block.service.js addBlockUser: " + blockedUsername + ", " + userId
    );
    const blockedUserInfo = await userRepository.findUserByUsername(
      blockedUsername
    );

    if (!blockedUserInfo) {
      const error = new Error("Block user not found.");
      error.status = 404;
      throw error;
    } else if (blockedUserInfo.id === userId) {
      const error = new Error("You cannot block yourself.");
      error.status = 400;
      throw error;
    }

    const likeInfo = await userLikeRepository.getLikeUserHistoryById(
      userId,
      blockedUserInfo.id
    );
    if (likeInfo.length > 0) {
      const error = new Error("You cannot block a user you like.");
      error.status = 400;
      throw error;
    }

    await userBlockRepository.addBlockUser(blockedUserInfo.id, userId);
  } catch (error) {
    logger.error("user.block.service.js addBlockUser: " + error.message);
    throw error;
  }
};

const deleteBlockUser = async (blockedUsername, userId) => {
  try {
    logger.info(
      "user.block.service.js deleteBlockUser: " +
        blockedUsername +
        ", " +
        userId
    );
    const blockedUserInfo = await userRepository.findUserByUsername(
      blockedUsername
    );

    if (!blockedUserInfo) {
      const error = new Error("Block user not found.");
      error.status = 404;
      throw error;
    }
    await userBlockRepository.deleteBlockUser(blockedUserInfo.id, userId);
  } catch (error) {
    logger.error("user.block.service.js deleteBlockUser: " + error.message);
    throw error;
  }
};

module.exports = {
  addBlockUser,
  deleteBlockUser,
};

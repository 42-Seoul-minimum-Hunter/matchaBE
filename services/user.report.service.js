const userReportRepository = require("../repositories/user.report.repository");
const userRepository = require("../repositories/user.repository");
const userBlockRepository = require("../repositories/user.block.repository");
const userLikeRepository = require("../repositories/user.like.repository");

const logger = require("../configs/logger");

const reportUser = async (reportedUsername, userId) => {
  try {
    logger.info(
      "user.report.service.js reportUser: " + reportedUsername + ", " + userId
    );
    const reportedUserInfo = await userRepository.findUserByUsername(
      reportedUsername
    );
    if (!reportedUserInfo) {
      const error = new Error("Report user not found.");
      error.status = 404;
      throw error;
    }

    const likeInfo = await userLikeRepository.getLikeUserHistoryById(
      userId,
      reportedUserInfo.id
    );
    if (likeInfo.length > 0) {
      const error = new Error("You cannot block a user you like.");
      error.status = 400;
      throw error;
    }

    await userReportRepository.reportUser(reportedUserInfo.id, userId);
    await userBlockRepository.addBlockUser(reportedUserInfo.id, userId);
  } catch (error) {
    logger.error("user.report.service.js reportUser: " + error.message);
    throw error;
  }
};

module.exports = {
  reportUser,
};

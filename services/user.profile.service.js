const bcrypt = require("bcrypt");

const userProfileImageRepository = require("../repositories/user.profileImage.repository");
const userHashtagRepository = require("../repositories/user.hashtag.repository");
const userRegionRepository = require("../repositories/user.region.repository");
const userRateRepository = require("../repositories/user.rate.repository");
const userBlockRepository = require("../repositories/user.block.repository");
const userAlarmRepository = require("../repositories/user.alarm.repository");
const userLikeRepository = require("../repositories/user.like.repository");
const userChatRepository = require("../repositories/user.chat.repository");

const userRepository = require("../repositories/user.repository");

const authRepository = require("../repositories/auth.repository");

const logger = require("../configs/logger");

const getUserProfile = async (username, userId) => {
  try {
    logger.info(
      "user.profile.service.js getUserProfile: " + username + ", " + userId
    );
    const userInfo = await userRepository.findUserByUsername(username);
    if (!userInfo) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    //console.log("user info", userInfo.rows[0]);

    const hashtagInfo = await userHashtagRepository.findHashtagById(
      userInfo.id
    );
    const regionInfo = await userRegionRepository.findRegionById(userInfo.id);
    const profileImageInfo =
      await userProfileImageRepository.findProfileImagesById(userInfo.id);
    const rateInfo = await userRateRepository.findRateInfoById(userInfo.id);

    let rate;

    if (!rateInfo || rateInfo.length === 0) {
      rate = parseFloat(0);
    } else {
      const ratingScores = rateInfo.map((row) => row.rate_score);
      const totalScore = ratingScores.reduce((acc, score) => acc + score, 0);
      rate = totalScore / rateInfo.length;
    }

    const blockInfo = await userBlockRepository.getBlockRelationByid(
      userId,
      userInfo.id
    );

    let isBlocked = true;

    if (!blockInfo) {
      isBlocked = false;
    }

    const sendedlikedInfo = await userLikeRepository.getLikeUserHistoryById(
      userId,
      userInfo.id
    );

    const receivedlikedInfo = await userLikeRepository.getLikeUserHistoryById(
      userInfo.id,
      userId
    );

    const chatRoomInfo = await userChatRepository.findOneChatRoomById(
      userId,
      userInfo.id
    );

    const user = {
      id: userInfo.id,
      username: userInfo.username,
      lastName: userInfo.last_name,
      firstName: userInfo.first_name,
      gender: userInfo.gender,
      preference: userInfo.preference,
      biography: userInfo.biography,
      age: userInfo.age,
      connectedAt: userInfo.connected_at,

      hashtags: hashtagInfo[0],
      profileImages: profileImageInfo[0],
      si: regionInfo[0].si,
      gu: regionInfo[0].gu,
      rate: rate,
      isBlocked: isBlocked,
      isOnline: false,
      isSendedLiked: sendedlikedInfo.length > 0 ? true : false,
      isReceivedLiked: receivedlikedInfo.length > 0 ? true : false,
      isLinked: chatRoomInfo.length > 0 ? true : false,
    };

    if (userId !== userInfo.id) {
      await userAlarmRepository.saveAlarmById(userId, userInfo.id, "VISITED");
    }
    return user;
  } catch (error) {
    logger.error("user.profile.service.js getUserProfile: " + error.message);
    throw error;
  }
};

const getMyInfo = async (userId) => {
  try {
    logger.info("user.profile.service.js getMyInfo: " + userId);
    const userInfo = await userRepository.findUserById(userId);
    const hashtagInfo = await userHashtagRepository.findHashtagById(userId);
    const regionInfo = await userRegionRepository.findRegionById(userId);
    const profileImageInfo =
      await userProfileImageRepository.findProfileImagesById(userId);
    const rateInfo = await userRateRepository.findRateInfoById(userId);

    let rate;
    if (!rateInfo || rateInfo.length === 0) {
      rate = parseFloat(0);
    } else {
      const ratingScores = rateInfo.map((row) => row.rate_score);
      const totalScore = ratingScores.reduce((acc, score) => acc + score, 0);
      rate = totalScore / rateInfo.length;
    }

    const authInfo = await authRepository.findAuthInfoById(userId);

    const user = {
      username: userInfo.username,
      lastName: userInfo.last_name,
      firstName: userInfo.first_name,
      gender: userInfo.gender,
      preference: userInfo.preference,
      biography: userInfo.biography,
      age: userInfo.age,
      isOnline: true,

      hashtags: hashtagInfo[0],
      profileImages: profileImageInfo[0],
      si: regionInfo[0].si,
      gu: regionInfo[0].gu,
      rate: rate,
    };

    return user;
  } catch (error) {
    logger.error("user.profile.service.js getMyInfo: " + error.message);
    throw error;
  }
};

const getSettingsInfo = async (userId) => {
  try {
    logger.info("user.profile.service.js getSettingsInfo: " + userId);
    const userInfo = await userRepository.findUserById(userId);
    const hashtagInfo = await userHashtagRepository.findHashtagById(userId);
    const regionInfo = await userRegionRepository.findRegionById(userId);
    const profileImageInfo =
      await userProfileImageRepository.findProfileImagesById(userId);
    const rateInfo = await userRateRepository.findRateInfoById(userId);

    let rate;
    if (!rateInfo || rateInfo.length === 0) {
      rate = parseFloat(0);
    } else {
      const ratingScores = rateInfo.map((row) => row.rate_score);
      const totalScore = ratingScores.reduce((acc, score) => acc + score, 0);
      rate = totalScore / rateInfo.length;
    }

    const authInfo = await authRepository.findAuthInfoById(userId);

    const user = {
      email: userInfo.email,
      username: userInfo.username,
      lastName: userInfo.last_name,
      firstName: userInfo.first_name,
      gender: userInfo.gender,
      preference: userInfo.preference,
      biography: userInfo.biography,
      age: userInfo.age,

      hashtags: hashtagInfo[0],
      profileImages: profileImageInfo[0],
      si: regionInfo[0].si,
      gu: regionInfo[0].gu,
      rate: rate,

      isGpsAllowed: authInfo.is_gps_allowed,
      isTwofa: authInfo.is_twofa,
    };

    return user;
  } catch (error) {
    logger.error("user.profile.service.js getSettingsInfo: " + error.message);
    throw error;
  }
};

const updateUser = async (UserUpdateDto, userId) => {
  try {
    logger.info(
      "user.profile.service.js updateUser: " +
        JSON.stringify(UserUpdateDto) +
        ", " +
        JSON.stringify(userId)
    );
    const userInfo = await userRepository.findUserById(userId);
    if (!userInfo) {
      const error = new Error("User Not Found");
      error.status = 404;
      throw error;
    }

    await authRepository.updateGpsAllowedById(
      userId,
      UserUpdateDto.isGpsAllowed
    );

    await authRepository.updateTwoFactorById(userId, UserUpdateDto.isTwofa);

    await userRepository.updateUserById(UserUpdateDto, userId);
    await userHashtagRepository.updateHashtagById(
      UserUpdateDto.hashtags,
      userId
    );
    await userRegionRepository.updateRegionById(
      UserUpdateDto.si,
      UserUpdateDto.gu,
      userId
    );
    await userProfileImageRepository.updateProfileImagesById(
      UserUpdateDto.profileImages,
      userId
    );
  } catch (error) {
    logger.error("user.profile.service.js updateUser: " + error.message);
    throw error;
  }
};

module.exports = {
  getUserProfile,
  getMyInfo,
  updateUser,
  getSettingsInfo,
};

const bcrypt = require("bcrypt");

const userProfileImageRepository = require("../repositories/user.profileImage.repository");
const userHashtagRepository = require("../repositories/user.hashtag.repository");
const userRegionRepository = require("../repositories/user.region.repository");
const userRateRepository = require("../repositories/user.rate.repository");
const userBlockRepository = require("../repositories/user.block.repository");
const userAlarmRepository = require("../repositories/user.alarm.repository");

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
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
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
    console.log("rateInfo", rateInfo);
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

    if (!blockInfo || blockInfo.length === 0) {
      isBlocked = false;
    }

    const user = {
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
      isBlocked: isBlocked,
    };

    await userAlarmRepository.saveAlarmById(userId, userInfo.id, "VISITED");
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

    const user = {
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
    };

    return user;
  } catch (error) {
    logger.error("user.profile.service.js getMyInfo: " + error.message);
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
    const userInfo = await userRepository.findUserByEmail(UserUpdateDto.email);
    const hashed = await bcrypt.hash(UserUpdateDto.password, 10);
    UserUpdateDto.password = hashed;

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
    await userHashtagRepository.saveHashtagById(UserUpdateDto.hashtags, userId);
    await userRegionRepository.saveRegionById(
      UserUpdateDto.si,
      UserUpdateDto.gu,
      userId
    );
    await userProfileImageRepository.saveProfileImagesById(
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
};

const userProfileImageRepository = require("../repositories/user.profileImage.repository");
const userHashtagRepository = require("../repositories/user.hashtag.repository");
const userRegionRepository = require("../repositories/user.region.repository");
const userRateRepository = require("../repositories/user.rate.repository");
const userBlockRepository = require("../repositories/user.block.repository");
const userAlarmRepository = require("../repositories/user.alarm.repository");

const userRepository = require("../repositories/user.repository");

const getUserProfile = async (username, userId) => {
  try {
    const userInfo = await userRepository.findUserByUsername(username);
    if (!userInfo) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    } else if (userInfo.id === userId) { //TODO: 논의 필요
      const error = new Error("You cannot see your own profile");
      error.status = 403;
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

    if (!blockInfo || blockInfo.rows.length === 0) {
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
    return { error: error.message };
  }
};

const getMyInfo = async (userId) => {
  try {

    const hashtagInfo = await userHashtagRepository.findHashtagById(
      userId
    );
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
    return { error: error.message };
  }
};

const updateUser = async (UserUpdateDto, userId) => {
  try {
    const userInfo = await userRepository.findUserByEmail(UserUpdateDto.email);

    if (userInfo) {
      const error = new Error("User already exists");
      error.status = 409;
      throw error;
    }

    await userRepository.updateUserById(UserUpdateDto, userId);
    await userHashtagRepository.updateHashtagById(
      UserUpdateDto.hashtags,
      UserUpdateDto.userId
    );
    await userRegionRepository.updateRegionById(
      UserUpdateDto.region,
      UserUpdateDto.userId
    );
    await userProfileImageRepository.updateProfileImagesById(
      UserUpdateDto.profileImages,
      UserUpdateDto.userId
    );
  } catch (error) {
    return { error: error.message };
  }
};

module.exports = {
  getUserProfile,
  getMyInfo,
  updateUser,
};

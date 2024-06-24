const userProfileImageRepository = require("../repositories/user.profileImage.repository");
const userHashtagRepository = require("../repositories/user.hashtag.repository");
const userRegionRepository = require("../repositories/user.region.repository");
const userRateRepository = require("../repositories/user.rate.repository");
const userBlockRepository = require("../repositories/user.block.repository");

const userRepository = require("../repositories/user.repository");

const getUserProfile = async (username, userId) => {
  try {
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
    console.log("hashtag info", hashtagInfo);
    const regionInfo = await userRegionRepository.findRegionById(userInfo.id);
    console.log("region info", regionInfo);
    const profileImageInfo =
      await userProfileImageRepository.findProfileImagesById(userInfo.id);
    console.log("profile image info", profileImageInfo);
    const rateInfo = await userRateRepository.findRateInfoById(userInfo.id);
    console.log("rate info", rateInfo);

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

    console.log("user info", userInfo);
    console.log("hashtag info", hashtagInfo);
    console.log("region info", regionInfo);
    console.log("profile image info", profileImageInfo);
    console.log("rate info", rateInfo);
    console.log("is blocked", isBlocked);

    const user = {
      username: userInfo.username,
      lastName: userInfo.last_name,
      firstName: userInfo.first_name,
      gender: userInfo.gender,
      preference: userInfo.preference,
      biography: userInfo.biography,
      age: userInfo.age,

      hashtags: hashtagInfo[0][0],
      profileImages: profileImageInfo[0][0],
      si: regionInfo[0].si,
      gu: regionInfo[0].gu,
      rate: rate,
      isBlocked: isBlocked,
    };

    return user;
  } catch (error) {
    return { error: error.message };
  }
};

const getMyInfo = async (userId) => {
  try {
    const userInfo = await userRepository.findUserById(userId);
    if (!userInfo) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    const hashtagInfo = await userHashtagRepository.findHashtagById(
      userInfo.id
    );
    const regionInfo = await userRegionRepository.findRegionById(userInfo.id);
    const profileImageInfo =
      await userProfileImageRepository.findProfileImagesById(userInfo.id);
    const rateInfo = await userRateRepository.findRateInfoById(userInfo.id);

    let rate;
    if (rateInfo.length === 0) {
      rate = parseFloat(0);
    } else {
      const ratingScores = rateInfo.map((row) => row.rate_score);
      const totalScore = ratingScores.reduce((acc, score) => acc + score, 0);
      rate = totalScore / rateInfo.length;
    }

    const user = {
      username: userInfo.rows[0].username,
      lastName: userInfo.rows[0].last_name,
      firstName: userInfo.rows[0].first_name,
      gender: userInfo.rows[0].gender,
      preference: userInfo.rows[0].preference,
      biography: userInfo.rows[0].biography,
      age: userInfo.rows[0].age,

      hashtags: hashtags,
      profileImages: profileImageInfo[0],
      region: regionInfo.rows,
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

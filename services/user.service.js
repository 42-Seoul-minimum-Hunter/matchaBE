const bcrypt = require("bcrypt");
const logger = require("../configs/logger.js");

const userRepository = require("../repositories/user.repository");
const userHashtagRepository = require("../repositories/user.hashtag.repository");
const userRegionRepository = require("../repositories/user.region.repository");
const userBlockRepository = require("../repositories/user.block.repository");
const userProfileImageRepository = require("../repositories/user.profileImage.repository");
const userRateRepository = require("../repositories/user.rate.repository");
const authRepository = require("../repositories/auth.repository");

// https://goodmemory.tistory.com/137
//https://jinyisland.kr/post/middleware/
const createUser = async (userInfo, email, password) => {
  try {
    logger.info(
      "user.service.js createUser: " +
        JSON.stringify(userInfo) +
        ", " +
        email +
        ", " +
        password
    );

    if (await userRepository.findUserByUsername(userInfo.username)) {
      const error = new Error("It has already been registered username");
      error.status = 409;
      throw error;
    }

    const userId = await userRepository.createUser(userInfo, email, password);

    if (!userId) {
      const error = new Error("User creation failed");
      error.status = 400;
      throw error;
    }

    await authRepository.saveAuthInfoById(
      userId,
      userInfo.isGpsAllowed,
      userInfo.isOauth
    );

    await userHashtagRepository.saveHashtagById(userInfo.hashtags, userId);
    await userRegionRepository.saveRegionById(userInfo.si, userInfo.gu, userId);
    await userProfileImageRepository.saveProfileImagesById(
      userInfo.profileImages,
      userId
    );

    return userId;
  } catch (error) {
    logger.error("user.service.js createUser: " + error.message);
    throw error;
  }
};

const unregister = async (id) => {
  try {
    logger.info("user.service.js unregister: " + id);
    await userRepository.deleteUserById(id);
  } catch (error) {
    logger.error("user.service.js unregister: " + error.message);
    throw error;
  }
};

const changePassword = async (password, email) => {
  try {
    logger.info("user.service.js changePassword: " + email);
    const hashed = await bcrypt.hash(password, 10);

    await userRepository.changePassword(hashed, email);
  } catch (error) {
    logger.error("user.service.js changePassword: " + error.message);
    throw error;
  }
};

const findUserByFilter = async (id, filter, page, pageSize) => {
  try {
    logger.info(
      "user.service.js findUserByFilter: " +
        id +
        ", " +
        JSON.stringify(filter) +
        ", " +
        page +
        ", " +
        pageSize
    );

    const isFilterNull = Object.values(filter).every((value) => !value);

    let users, totalCount, filteredByBlock, filteredInfo;
    if (isFilterNull === true) {
      const userInfo = await userRepository.findUserById(id);
      const userRegionInfo = await userRegionRepository.findRegionById(id);
      const userHashtagInfo = await userHashtagRepository.findHashtagById(id);

      filteredInfo = await userRepository.findUserByDefaultFilter(
        id,
        userInfo.preference,
        userRegionInfo[0].si,
        userRegionInfo[0].gu,
        userHashtagInfo[0]
      );
    } else {
      filteredInfo = await userRepository.findUserByFilter(filter, id);
    }

    //console.log("filteredInfo: " + JSON.stringify(filteredInfo));
    users = filteredInfo.users;
    totalCount = filteredInfo.totalCount;
    console.log("id : " + id);
    filteredByBlock = await userBlockRepository.filterBlockedUser(id, users);

    // 페이지네이션 처리
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedUsers = filteredByBlock.slice(startIndex, endIndex);

    return {
      users: paginatedUsers,
      totalCount: filteredByBlock.length,
    };
  } catch (error) {
    logger.error("user.service.js findUserByFilter: " + error.message);
    throw error;
  }
};

const findOneUserByUsername = async (username) => {
  try {
    logger.info("user.service.js findOneUserByUsername: " + username);
    return await userRepository.findUserByUsername(username);
  } catch (error) {
    logger.error("user.service.js findOneUserByUsername: " + error.message);
    throw error;
  }
};

const findOneUserById = async (id) => {
  try {
    logger.info("user.service.js findOneUserById: " + id);
    return await userRepository.findUserById(id);
  } catch (error) {
    logger.error("user.service.js findOneUserById: " + error.message);
    throw error;
  }
};

const findOneUserByEmail = async (email) => {
  try {
    logger.info("user.service.js findOneUserByEmail: " + email);
    return await userRepository.findUserByEmail(email);
  } catch (error) {
    logger.error("user.service.js findOneUserByEmail: " + error.message);
    throw error;
  }
};

const updateConnectedAtById = async (id) => {
  try {
    logger.info("auth.service.js updateConnectedAtById: " + id);
    await userRepository.updateConnectedAtById(id);
  } catch (error) {
    logger.error("auth.service.js updateConnectedAtById: " + error.message);
    throw error;
  }
};

module.exports = {
  createUser,
  unregister,
  changePassword,
  findUserByFilter,
  findOneUserByUsername,
  findOneUserById,
  findOneUserByEmail,
  updateConnectedAtById,
};

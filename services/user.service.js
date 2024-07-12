const bcrypt = require("bcrypt");
const logger = require("../configs/logger.js");

const userRepository = require("../repositories/user.repository");
const userHashtagRepository = require("../repositories/user.hashtag.repository");
const userRegionRepository = require("../repositories/user.region.repository");
const userBlockRepository = require("../repositories/user.block.repository");
const userProfileImageRepository = require("../repositories/user.profileImage.repository");
const userRateRepository = require("../repositories/user.rate.repository");

// https://goodmemory.tistory.com/137
//https://jinyisland.kr/post/middleware/
const createUser = async (UserCreateDto) => {
  try {
    logger.info("user.service.js createUser: " + JSON.stringify(UserCreateDto))
    const hashed = await bcrypt.hash(UserCreateDto.password, 10);
    UserCreateDto.password = hashed;

    if (await userRepository.findUserByEmail(UserCreateDto.email)) {
      const error = new Error("It has already been registered email");
      error.status = 409;
      throw error;
    } else if (
      await userRepository.findUserByUsername(UserCreateDto.username)
    ) {
      const error = new Error("It has already been registered username");
      error.status = 409;
      throw error;
    }

    const userId = await userRepository.createUser(UserCreateDto);

    if (!userId) {
      const error = new Error("User creation failed");
      error.status = 400;
      throw error;
    }

    await userHashtagRepository.saveHashtagById(UserCreateDto.hashtags, userId);
    await userRegionRepository.saveRegionById(
      UserCreateDto.si,
      UserCreateDto.gu,
      userId
    );
    await userProfileImageRepository.saveProfileImagesById(
      UserCreateDto.profileImages,
      userId
    );

    return userId;
  } catch (error) {
    info.error("user.service.js createUser: " + error.message)
    throw error;
  }
};

const unregister = async (id) => {
  try {
    logger.info("user.service.js unregister: " + id)
    await userRepository.deleteUserById(id);
  } catch (error) {
    logger.error("user.service.js unregister: " + error.message)
    throw error;
  }
};

const changePassword = async (password, email) => {
  try {
    logger.info("user.service.js changePassword: " + email)
    const hashed = await bcrypt.hash(password, 10);

    await userRepository.changePassword(hashed, email);
  } catch (error) {
    logger.error("user.service.js changePassword: " + error.message)
    throw error;
  }
};

const findUserByFilter = async (id, filter, page, pageSize) => {
  try {

    logger.info("user.service.js findUserByFilter: " + id + ", " + JSON.stringify(filter) + ", " + page + ", " + pageSize)

    const isFilterNull = Object.values(filter).every((value) => !value);
    
    let users, totalCount, filteredByBlock, filteredInfo;
    if (isFilterNull === true) {
      const userInfo = await userRepository.findUserById(id);
      const userRegionInfo = await userRegionRepository.findRegionById(id);
      const userHashtagInfo = await userHashtagRepository.findHashtagById(id);

      filteredInfo = await userRepository.findUserByDefaultFilter(userInfo.preference, userRegionInfo[0].si, userRegionInfo[0].gu, userHashtagInfo[0],page, pageSize);
    } else {
      filteredInfo = await userRepository.findUserByFilter(
        filter,
        page,
        pageSize
      );
    }
    users = filteredInfo.users;
    totalCount = filteredInfo.totalCount;
    filteredByBlock = await userBlockRepository.filterBlockedUser(
      filter.userId,
      users
    );
    return {
      users: filteredByBlock,
      totalCount: totalCount,
    };
  } catch (error) {
    logger.error("user.service.js findUserByFilter: " + error.message)
    throw error;
  }
};

const findOneUserByUsername = async (username) => {
  try {
    logger.info("user.service.js findOneUserByUsername: " + username)
    return await userRepository.findUserByUsername(username);
  } catch (error) {
    logger.error("user.service.js findOneUserByUsername: " + error.message)
    throw error;
  }
};

const findOneUserById = async (id) => {
  try {
    logger.info("user.service.js findOneUserById: " + id)
    return await userRepository.findUserById(id);
  } catch (error) {
    logger.error("user.service.js findOneUserById: " + error.message)
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
};

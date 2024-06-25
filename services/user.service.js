const bcrypt = require("bcrypt");

const userRepository = require("../repositories/user.repository");
const userHashtagRepository = require("../repositories/user.hashtag.repository");
const userRegionRepository = require("../repositories/user.region.repository");
const userBlockRepository = require("../repositories/user.block.repository");
const userProfileImageRepository = require("../repositories/user.profileImage.repository");

// TODO : username, password 정규표현식, email 형식 확인

// https://goodmemory.tistory.com/137
//https://jinyisland.kr/post/middleware/
const createUser = async (UserCreateDto) => {
  try {
    console.log("user.service.createUser");
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
    console.log(error);
    throw error;
  }
};

const unregister = async (id) => {
  try {
    await userRepository.deleteUserById(id);
  } catch (error) {
    return { error: error.message };
  }
};

const changePassword = async (password, email) => {
  try {
    const hashed = await bcrypt.hash(password, 10);

    await userRepository.changePassword(hashed, email);
  } catch (error) {
    return { error: error.message };
  }
};

const findUserByFilter = async (filter, page, pageSize) => {
  try {
    const { users, totalCount } = await userRepository.findUserByFilter(
      filter,
      page,
      pageSize
    );
    const filteredByBlock = await userBlockRepository.filterBlockedUser(
      filter.userId,
      users
    );
    return {
      users: filteredByBlock,
      totalCount: totalCount,
    };
  } catch (error) {
    return { error: error.message };
  }
};

const checkRightRegion = async (si, gu) => {
  try {
    switch (si) {
    }
  } catch (error) {
    return { error: error.message };
  }
};

const findOneUserByUsername = async (username) => {
  try {
    return await userRepository.findUserByUsername(username);
  } catch (error) {
    return { error: error.message };
  }
};

const findOneUserById = async (id) => {
  try {
    return await userRepository.findUserById(id);
  } catch (error) {
    return { error: error.message };
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

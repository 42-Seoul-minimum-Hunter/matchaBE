const bcrypt = require('bcrypt');

const userRepository = require('../repositories/user.repository');
const userHashtagRepository = require('../repositories/user.hashtag.repository');
const userRegionRepository = require('../repositories/user.region.repository');
const userBlockRepository = require('../repositories/user.block.repository');
const userProfileImageRepository = require('../repositories/user.profileImage.repository');

// TODO : username, password 정규표현식, email 형식 확인


// https://goodmemory.tistory.com/137
//https://jinyisland.kr/post/middleware/
const createUser = async (UserCreateDto) => {
    try {
        const hashed = await bcrypt.hash(UserCreateDto.password, 10);
        UserCreateDto.password = hashed;

        if (await userRepository.findUserByEmail(UserCreateDto.email) ||
            await userRepository.findUserByUsername(UserCreateDto.username)) {
            throw new Error('이미 존재하는 사용자입니다.');
        }

        const userId = await userRepository.createUser(UserCreateDto);

        await userHashtagRepository.saveHashtagById(UserCreateDto.hashtags, userId);
        await userRegionRepository.saveRegionById(UserCreateDto.region.si, UserCreateDto.region.gu, userId);
        await userProfileImageRepository.saveProfileImagesById(UserCreateDto.profileImages, userId);

        return userId;
    } catch (error) {
        return { error: error.message };
    }
}

const deleteUser = async (id) => {
    try {

        await userRepository.deleteUser(id);
    } catch (error) {
        return { error: error.message };
    }
}

const changePassword = async (password, email) => {
    try {
        const hashed = await bcrypt.hash(password, 10);

        await userRepository.changePassword(hashed, email);
    } catch (error) {
        return { error: error.message };
    }
}

const findUserByFilter = async (filter) => {
    try {
        const userInfos = await userRepository.findUserByFilter(filter);
        const filteredByBlock = await userBlockRepository.filterBlockedUser(filter.userId, userInfos);
        return filteredByBlock;
    } catch (error) {
        return { error: error.message };
    }
}

const checkRightRegion = async (si, gu) => {
    try {

        switch (si) { }

    } catch (error) {
        return { error: error.message };
    }
}



module.exports = {
    createUser,
    deleteUser,
    changePassword,
    findUserByFilter,
};
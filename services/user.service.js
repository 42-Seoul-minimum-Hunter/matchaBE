const bcrypt = require('bcrypt');

const userRepository = require('../repositories/user.repository');
const userBlockRepository = require('../repositories/user.block.repository');

const { si, seoul, gyeonggi, incheon, daejeon, daegu, busan, ulsan, gwangju, gangwon, chungbuk, chungnam, gyeongbuk, gyeongnam, jeonbuk, jeonnam, jeju } = require('/Users/min-yeongjae/matcha/enums/user.region.enum.js');



// TODO : username, password 정규표현식, email 형식 확인


// https://goodmemory.tistory.com/137
//https://jinyisland.kr/post/middleware/
const createUser = async (req, UserCreateDto) => {
    try {
        const hashed = await bcrypt.hash(UserCreateDto.password, 10);
        UserCreateDto.password = hashed;

        const userId = await userRepository.createUser(UserCreateDto);

        await userRepository.saveHashtags(UserCreateDto.hashtags, userId);
        await userRepository.saveRegion(UserCreateDto.region, userId);
        const resultUserInfo = await userRepository.saveProfileImages(UserCreateDto, userId);

        return resultUserInfo;
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
        //console.log("service");
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
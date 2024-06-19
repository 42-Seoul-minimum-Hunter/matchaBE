const bcrypt = require('bcrypt');

const UserRepository = require('../repositories/user.repository');

import { si, seoul, gyeonggi, incheon, daejeon, daegu, busan, ulsan, gwangju, gangwon, chungbuk, chungnam, gyeongbuk, gyeongnam, jeonbuk, jeonnam, jeju } from '/Users/min-yeongjae/matcha/enums/user.region.enum.js';



// TODO : username, password 정규표현식


// https://goodmemory.tistory.com/137
//https://jinyisland.kr/post/middleware/
const createUser = async (UserCreateDto) => {
    try {
        const hashed = await bcrypt.hash(UserCreateDto.password, 10);
        UserCreateDto.password = hashed;
        const userId = await UserRepository.createUser(UserCreateDto);

        await UserRepository.saveHashtags(UserCreateDto.hashtags, userId);
        await UserRepository.saveRegion(UserCreateDto.region, userId);
        const resultUserInfo = await UserRepository.saveProfileImages(UserCreateDto, userId);

        return resultUserInfo;
    } catch (error) {
        return { error: error.message };
    }
}

const deleteUser = async (id) => {
    try {

        await UserRepository.deleteUser(id);
    } catch (error) {
        return { error: error.message };
    }
}

const changePassword = async (password, email) => {
    try {
        const hashed = await bcrypt.hash(password, 10);
        await UserRepository.changePassword(hashed, email);
        //console.log("service");
    } catch (error) {
        return { error: error.message };
    }
}

const findUserByFilter = async (filter) => {
    try {
        const userInfos = await UserRepository.findUserByFilter(filter);
        return userInfos;
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
const bcrypt = require('bcrypt');

const UserRepository = require('../repositories/user.repository');

// TODO : username, password 정규표현식


// https://goodmemory.tistory.com/137
//https://jinyisland.kr/post/middleware/
const createUser = async (UserCreateDto) => {
    try {
        const hashed = await bcrypt.hash(UserCreateDto.password, 10);
        UserCreateDto.password = hashed;
        const user_id = await UserRepository.createUser(UserCreateDto);

        UserRepository.saveHashtag(UserCreateDto.hashtags, user_id);
        UserRepository.saveRegion(UserCreateDto.region, user_id);
        UserRepository.saveProfileImages(UserCreateDto.profileImages, user_id);

        return user_id;
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

const changePassword = async (password, id) => {
    try {
        const hashed = await bcrypt.hash(password, 10);
        await UserRepository.changePassword(hashed, id);
        //console.log("service");
    } catch (error) {
        return { error: error.message };
    }
}

const findUserByUsername = async (filter) => {
    try {
        const userInfos = await UserRepository.findUserByUsername(filter);
        return userInfos;
    } catch (error) {
        return { error: error.message };
    }
}





module.exports = {
    createUser,
    deleteUser,
    changePassword,
    findUserByUsername
};
const bcrypt = require('bcrypt');

const UserRepository = require('../repositories/user.repository');

// https://goodmemory.tistory.com/137
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

        const error = await UserRepository.deleteUser(id);
        if (error) {
            return { error: error.message };
        }
    } catch (error) {
        console.log("service");
        return { error: error.message };
    }
}

module.exports = {
    createUser,
    deleteUser
};
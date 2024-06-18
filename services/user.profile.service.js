const bcrypt = require('bcrypt');

const UserProfileRepository = require('../repositories/user.profile.repository');

const findUserByUsername = async (username, userId) => {
    try {
        const user = await UserProfileRepository.findUserByUsername(username, userId);
        return user;
    } catch (error) {
        return { error: error.message };
    }
}

const getMyInfo = async (userId) => {
    try {
        const user = await UserProfileRepository.getMyInfo(userId);
        return user;
    } catch (error) {
        return { error: error.message };
    }
}

const updateUser = async (UserUpdateDto, userId) => {
    try {
        await UserProfileRepository.updateUser(UserUpdateDto, userId);
        await UserProfileRepository.updateHashtags(UserUpdateDto.hashtags, userId);
        await UserProfileRepository.updateRegion(UserUpdateDto.region, userId);
        await UserProfileRepository.updateProfileImages(UserUpdateDto.profileImages, userId);
    } catch (error) {
        return { error: error.message };
    }
}



module.exports = {
    findUserByUsername,
    getMyInfo,
    updateUser
};
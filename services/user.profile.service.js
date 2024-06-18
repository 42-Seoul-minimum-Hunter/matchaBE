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

const updateUser = async (UserUpdateDto) => {
    try {
        await UserProfileRepository.updateUser(UserUpdateDto);
        await UserProfileRepository.updateHashtags(UserUpdateDto.hashtags, UserUpdateDto.userId);
        await UserProfileRepository.updateRegion(UserUpdateDto.region, UserUpdateDto.userId);
        await UserProfileRepository.updateProfileImages(UserUpdateDto.profileImages, UserUpdateDto.userId);
    } catch (error) {
        return { error: error.message };
    }
}



module.exports = {
    findUserByUsername,
    getMyInfo,
    updateUser
};
const bcrypt = require('bcrypt');

const UserProfileRepository = require('../repositories/user.profile.repository');

const findUserByUsername = async (username, user_id) => {
    try {
        const user = await UserProfileRepository.findUserByUsername(username, user_id);
        return user;
    } catch (error) {
        return { error: error.message };
    }
}

const getMyInfo = async (user_id) => {
    try {
        const user = await UserProfileRepository.getMyInfo(user_id);
        return user;
    } catch (error) {
        return { error: error.message };
    }
}

const updateUser = async (UserUpdateDto, user_id) => {
    try {
        await UserProfileRepository.updateUser(UserUpdateDto, user_id);
        await UserProfileRepository.updateHashtags(UserUpdateDto.hashtags, user_id);
        await UserProfileRepository.updateRegion(UserUpdateDto.region, user_id);
        await UserProfileRepository.updateProfileImages(UserUpdateDto.profileImages, user_id);
    } catch (error) {
        return { error: error.message };
    }
}



module.exports = {
    findUserByUsername,
    getMyInfo,
    updateUser
};
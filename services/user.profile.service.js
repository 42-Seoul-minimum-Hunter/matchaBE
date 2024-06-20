const userProfileRepository = require('../repositories/user.profile.repository');
const userRepository = require('../repositories/user.repository');

const findUserByUsername = async (username, userId) => {
    try {



        const user = await userProfileRepository.findUserByUsername(username, userId);
        return user;
    } catch (error) {
        return { error: error.message };
    }
}

const getMyInfo = async (userId) => {
    try {
        const user = await userProfileRepository.getMyInfo(userId);
        return user;
    } catch (error) {
        return { error: error.message };
    }
}

const updateUser = async (UserUpdateDto) => {
    try {
        await userProfileRepository.updateUser(UserUpdateDto);
        await userProfileRepository.updateHashtags(UserUpdateDto.hashtags, UserUpdateDto.userId);
        await userProfileRepository.updateRegion(UserUpdateDto.region, UserUpdateDto.userId);
        await userProfileRepository.updateProfileImages(UserUpdateDto.profileImages, UserUpdateDto.userId);
    } catch (error) {
        return { error: error.message };
    }
}



module.exports = {
    findUserByUsername,
    getMyInfo,
    updateUser
};
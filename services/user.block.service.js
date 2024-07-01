const userBlockRepository = require('../repositories/user.block.repository');
const userRepository = require('../repositories/user.repository');

const addBlockUser = async (blockedUsername, userId) => {
    try {
        const blockedUserInfo = await userRepository.findUserByUsername(blockedUsername);

        if (!blockedUserInfo) {
            const error = new Error('Block user not found.');
            error.status = 404;
            throw error;
        }
        await userBlockRepository.addBlockUser(blockedUserInfo.id, userId);
    } catch (error) {
            console.log(error);
    throw error;
    }
}

const deleteBlockUser = async (blockedUsername, userId) => {
    try {
        const blockedUserInfo = await userRepository.findUserByUsername(blockedUsername);

        if (!blockedUserInfo) {
            const error = new Error('Block user not found.');
            error.status = 404;
            throw error;
        }
        await userBlockRepository.deleteBlockUser(blockedUserInfo.id, userId);
    } catch (error) {
            console.log(error);
    throw error;
    }
}

module.exports = {
    addBlockUser,
    deleteBlockUser
};
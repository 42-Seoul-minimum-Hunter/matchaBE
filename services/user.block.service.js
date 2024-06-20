const userBlockRepository = require('../repositories/user.block.repository');
const userRepository = require('../repositories/user.repository');

const addBlockUser = async (blockedUsername, userId) => {
    try {
        const blockedUserInfo = await userRepository.findUserByUsername(blockedUsername);

        if (!blockedUserInfo) {
            throw new Error('차단할 사용자가 존재하지 않습니다.');
        }
        await userBlockRepository.addBlockUser(blockedUserInfo.id, userId);
    } catch (error) {
        return { error: error.message };
    }
}

const deleteBlockUser = async (blockedUsername, userId) => {
    try {
        const blockedUserInfo = await userRepository.findUserByUsername(blockedUsername);

        if (!blockedUserInfo) {
            throw new Error('차단할 사용자가 존재하지 않습니다.');
        }
        await userBlockRepository.deleteBlockUser(blockedUserInfo.id, userId);
    } catch (error) {
        return { error: error.message };
    }
}

module.exports = {
    addBlockUser,
    deleteBlockUser
};
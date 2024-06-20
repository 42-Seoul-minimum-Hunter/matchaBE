const userBlockRepository = require('../repositories/user.block.repository');

const addBlockUser = async (blockUsername, userId) => {
    try {
        await userBlockRepository.addBlockUser(blockUsername, userId);
    } catch (error) {
        return { error: error.message };
    }
}

const deleteBlockUser = async (blockUsername, userId) => {
    try {
        await userBlockRepository.deleteBlockUser(blockUsername, userId);
    } catch (error) {
        return { error: error.message };
    }
}

module.exports = {
    addBlockUser,
    deleteBlockUser
};
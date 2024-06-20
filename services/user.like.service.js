const userLikeRepository = require('../repositories/user.like.repository');
const userChatRepository = require('../repositories/user.chat.repository');
const userRepository = require('../repositories/user.repository');

const addLikeUserByUsername = async (likedUsername, userId) => {
    try {
        const likedUserInfo = await userRepository.findUserByUsername(likedUsername);
        if (!likedUserInfo) {
            const error = new Error('Like user not found.');
            error.status = 404;
            throw error;
        }
        await userLikeRepository.addLikeUserByUsername(likedUserInfo.id, userId);
        await userChatRepository.generateChatRoom(likedUserInfo.id, userId);
    } catch (error) {
        return { error: error.message };
    }
}

const deleteLikeUserByUsername = async (likedUsername, userId) => {
    try {
        const likedUserInfo = await userRepository.findUserByUsername(likedUsername);
        if (!likedUserInfo) {
            const error = new Error('Like user not found.');
            error.status = 404;
            throw error;
        }
        await userLikeRepository.deleteLikeUserByUsername(likedUserInfo.id, userId);
        await userChatRepository.deleteChatRoom(likedUserInfo.id, userId);
    } catch (error) {
        return { error: error.message };
    }
}



module.exports = {
    addLikeUserByUsername,
    deleteLikeUserByUsername
};
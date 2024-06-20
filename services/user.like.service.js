const userLikeRepository = require('../repositories/user.like.repository');
const userChatRepository = require('../repositories/user.chat.repository');
const userRepository = require('../repositories/user.repository');

const addLikeUserByUsername = async (likeUsername, userId) => {
    try {
        const likeUserInfo = await userRepository.findUserByUsername(likeUsername);
        if (!likeUserInfo) {
            throw new Error('좋아요할 사용자가 존재하지 않습니다.');
        }
        await userLikeRepository.addLikeUserByUsername(likeUserInfo.id, userId);
        await userChatRepository.generateChatRoom(likeUserInfo.id, userId);
    } catch (error) {
        return { error: error.message };
    }
}

const deleteLikeUserByUsername = async (likeUsername, userId) => {
    try {
        const likeUserInfo = await userRepository.findUserByUsername(likeUsername);
        if (!likeUserInfo) {
            throw new Error('좋아요할 사용자가 존재하지 않습니다.');
        }
        await userLikeRepository.deleteLikeUserByUsername(likeUserInfo.id, userId);
        await userChatRepository.deleteChatRoom(likeUserInfo.id, userId);
    } catch (error) {
        return { error: error.message };
    }
}



module.exports = {
    addLikeUserByUsername,
    deleteLikeUserByUsername
};
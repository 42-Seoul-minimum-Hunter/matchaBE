const userLikeRepository = require('../repositories/user.like.repository');
const userChatRepository = require('../repositories/user.chat.repository');

const addLikeUserByUsername = async (likeUsername, userId) => {
    try {
        await userLikeRepository.addLikeUserByUsername(likeUsername, userId);
        await userChatRepository.generateChatRoom(likeUsername, userId);
    } catch (error) {
        return { error: error.message };
    }
}

const deleteLikeUserByUsername = async (likeUsername, userId) => {
    try {
        await userLikeRepository.deleteLikeUserByUsername(likeUsername, userId);
        await userChatRepository.deleteChatRoom(likeUsername, userId);
    } catch (error) {
        return { error: error.message };
    }
}



module.exports = {
    addLikeUserByUsername,
    deleteLikeUserByUsername
};
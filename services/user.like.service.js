const userLikeRepository = require('../repositories/user.like.repository');

const addLikeUserByUsername = async (likeUsername, userId) => {
    try {
        await userLikeRepository.addLikeUserByUsername(likeUsername, userId);
    } catch (error) {
        return { error: error.message };
    }
}

const deleteLikeUserByUsername = async (likeUsername, userId) => {
    try {
        await userLikeRepository.deleteLikeUserByUsername(likeUsername, userId);
    } catch (error) {
        return { error: error.message };
    }
}

module.exports = {
    addLikeUserByUsername,
    deleteLikeUserByUsername
};
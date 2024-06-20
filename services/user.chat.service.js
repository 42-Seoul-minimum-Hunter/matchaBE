const userChatRepository = require('../repositories/user.chat.repository');

const getChatInfo = async (userId) => {
    try {
        const chatInfo = await userChatRepository.getChatInfo(userId);
        return chatInfo;
    } catch (error) {
        return { error: error.message };
    }
}

module.exports = {
    getChatInfo
};
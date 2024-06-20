const userChatRepository = require('../repositories/user.chat.repository');
const userRepository = require('../repositories/user.repository');

const getChatInfo = async (userId) => {
    try {
        const { chatRoomInfo, recentChat } = await userChatRepository.getChatInfo(userId);

        let chatInfo = {}

        for (const chat of recentChat) {
            if (chat) {
                const chatRoom = chatRoomInfo.rows.find(room => room.id === chat.room_id);
                const otherUserId = chatRoom.user_id === userId ? chatRoom.chated_id : chatRoom.user_id;
                const userInfo = await userRepository.findUserById(otherUserId);

                if (userInfo.username) {
                    chatInfo.push({
                        username: userInfo.username,
                        content: chat.content,
                        createdAt: chat.created_at
                    });
                }

            }
        }

        return chatInfo;
    } catch (error) {
        return { error: error.message };
    }
}

module.exports = {
    getChatInfo
};
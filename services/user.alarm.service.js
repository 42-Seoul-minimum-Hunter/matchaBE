const userBlockRepository = require('../repositories/user.block.repository');

const userLikeRepository = require('../repositories/user.like.repository');
const userViewRepository = require('../repositories/user.view.repository');
const userChatRepository = require('../repositories/user.chat.repository');

const getAlarmsById = async (id) => {
    try {

        const viewInfo = await userViewRepository.getViewedHistoriesById(id);
        const likeInfo = await userLikeRepository.getLikeUserHistoriesById(id);
        const chatInfo = await userChatRepository.getChatHistoriesForAlarmById(id);

        const alarmInfo = [...viewInfo.rows, ...likeInfo.rows, ...chatInfo.rows].sort((a, b) => {
            return new Date(b.created_at) - new Date(a.created_at);
        });

        const filterdByBlocked = await userBlockRepository.filterBlockedUser(id, alarmInfo);

        await userLikeRepository.updateLikeUserHistoriesById(id);
        await userViewRepository.updateViewedHistoriesById(id);
        await userChatRepository.updateChatHistoriesForAlarmById(id);
        return filterdByBlocked;
    } catch (error) {
        return { error: error.message };
    }
}

module.exports = {
    getAlarmsById,
};
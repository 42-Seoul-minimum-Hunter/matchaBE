const userAlarmRepository = require('../repositories/user.alarm.repository');
const userBlockRepository = require('../repositories/user.block.repository');

const getAlarmsById = async (id) => {
    try {
        const alarms = await userAlarmRepository.getAlarmsById(id);
        const filterdByBlocked = await userBlockRepository.filterBlockedUser(id, alarms);
        return filterdByBlocked;
    } catch (error) {
        return { error: error.message };
    }
}

module.exports = {
    getAlarmsById,
};
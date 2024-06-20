const UserAlarmRepository = require('../repositories/user.alarm.repository');

const getAlarmsById = async (id) => {
    try {
        const alarms = await UserAlarmRepository.getAlarmsById(id);
        return alarms;
    } catch (error) {
        return { error: error.message };
    }
}

module.exports = {
    getAlarmsById,
};
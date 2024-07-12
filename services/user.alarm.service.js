const logger = require("../configs/logger");

const userAlarmRepository = require("../repositories/user.alarm.repository");
const userRepository = require("../repositories/user.repository");


const saveAlarmById = async (id, alarmedId, alarmType) => {
    try {
        logger.info("user.alarm.service.js saveAlarmById: " + id + ", " + alarmedId + ", " + alarmType)
        const alarmedUserInfo = await userRepository.findUserById(alarmedId);
        if (!alarmedUserInfo) {
            const error = new Error("User not found.");
            error.status = 404;
            throw error;
        }
        await userAlarmRepository.addAlarm(id, alarmedId, alarmType);

    } catch (error) {
        logger.error("user.alarm.service.js saveAlarmById: " + error.message);
        throw error;
    }
}

const findAllAlarmsById = async (id) => {
    try {
        logger.info("user.alarm.service.js findAllAlarmsById: " + id)
        const result = await userAlarmRepository.findAllAlarmsById(id);

        const alarmedInfos = await Promise.all(result.map(async (element) => {
            const alarmedUserInfo = await userRepository.findUserById(element.user_id);
            if (alarmedUserInfo) {
                return {
                    username: alarmedUserInfo.username,
                    alarm_type: element.alarm_type,
                    created_at: element.created_at
                };
            }
        }));

        return alarmedInfos.filter(Boolean);
    }
    catch (error) {
        logger.error("user.alarm.service.js findAllAlarmsById: " + error.message);
        throw error;
    }
};

const deleteAllAlarmsById = async (id) => {
    try {
        logger.info("user.alarm.service.js deleteAllAlarmsById: " + id);
        await userAlarmRepository.deleteAllAlarmsById(id);
    } catch (error) {
        logger.error("user.alarm.service.js deleteAllAlarmsById: " + error.message);
        throw error;
    }
}

module.exports = {
    saveAlarmById,
    findAllAlarmsById,
    deleteAllAlarmsById
};
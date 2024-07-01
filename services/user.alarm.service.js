const userAlarmRepository = require("../repositories/user.alarm.repository");
const userRepository = require("../repositories/user.repository");

const saveAlarmById = async (id, alarmedId, alarmType) => {
    try {
        const alarmedUserInfo = await userRepository.findUserById(alarmedId);
        if (!alarmedUserInfo) {
            const error = new Error("User not found.");
            error.status = 404;
            throw error;
        }
        await userAlarmRepository.addAlarm(id, alarmedId, alarmType);

    } catch (error) {
            console.log(error);
    throw error;
    }
}

const findAllAlarmsById = async (id) => {
    try {

        const result = await userAlarmRepository.findAllAlarmsById(id);

        let alarmedUserInfo = [];

        if (result) {
            result.forEach(async (element) => {
                const alarmedUserInfo = await userRepository.findUserById(element.alarmed_id);
                alarmedUserInfo.push({
                    username: alarmedUserInfo.username,
                    alarm_type: element.alarm_type,
                    created_at: element.created_at
                });
            });
        }
        return alarmedUserInfo;
    }
    catch (error) {
            console.log(error);
    throw error;
    }
};

const deleteAllAlarmsById = async (id) => {
    try {
        await userAlarmRepository.deleteAllAlarmsById(id);
    } catch (error) {
            console.log(error);
    throw error;
    }
}

module.exports = {
    saveAlarmById,
    findAllAlarmsById,
    deleteAllAlarmsById
};
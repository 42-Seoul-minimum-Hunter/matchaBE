const userRepository = require("../repositories/user.repository");
const userViewRepository = require("../repositories/user.view.repository");
const userAlarmRepository = require("../repositories/user.alarm.repository");

const logger = require("../configs/logger");

//TODO: 새로고침 시 중복 방문 기록이 생기는 문제 해결 필요
const saveVisitHistoryById = async (username, id) => {
  try {
    logger.info(
      "user.view.service.js saveVisitHistoryById: " + username + ", " + id
    );
    const visitedUserInfo = await userRepository.findUserByUsername(username);
    if (!visitedUserInfo) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }
    const userAlarmInfo = await userAlarmRepository.findAllAlarmsById(id);

    console.log("userAlarmInfo: ", userAlarmInfo);

    if (
      (userAlarmInfo &&
        userAlarmInfo.alarm_type === "VISITED" &&
        userAlarmInfo.user_id === visitedUserInfo.id &&
        userAlarmInfo.alarmed_id === id &&
        userAlarmInfo.deleted_at === null) ||
      visitedUserInfo.id === id
    ) {
      return null;
    } else {
      await userViewRepository.saveVisitHistoryById(id, visitedUserInfo.id);
    }
  } catch (error) {
    logger.error("user.view.service.js saveVisitHistoryById: " + error.message);
    throw error;
  }
};

module.exports = {
  saveVisitHistoryById,
};

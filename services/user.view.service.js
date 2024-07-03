const userRepository = require("../repositories/user.repository");
const userViewRepository = require("../repositories/user.view.repository");

const logger = require("../configs/logger");

const saveVisitHistoryById = async (username, id) => {
    try {
        logger.info("user.view.service.js saveVisitHistoryById: " + username + ", " + id);
        const visitedUserInfo = await userRepository.findUserByUsername(username);
        if (!visitedUserInfo) {
            const error = new Error("User not found.");
            error.status = 404;
            throw error;
        }
        await userViewRepository.saveVisitHistoryById(id, visitedUserInfo.id);
    } catch (error) {
        logger.error("user.view.service.js saveVisitHistoryById: " + error.message);
        throw error;
    }
};

module.exports = {
    saveVisitHistoryById
};

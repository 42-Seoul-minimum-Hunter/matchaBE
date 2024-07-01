const userRepository = require("../repositories/user.repository");
const userViewRepository = require("../repositories/user.view.repository");

const saveVisitHistoryById = async (username, id) => {
    try {
        const visitedUserInfo = await userRepository.findUserByUsername(username);
        if (!visitedUserInfo) {
            const error = new Error("User not found.");
            error.status = 404;
            throw error;
        }
        await userViewRepository.saveVisitHistoryById(id, visitedUserInfo.id);
    } catch (error) {
            console.log(error);
    throw error;
    }
};

module.exports = {
    saveVisitHistoryById
};

const bcrypt = require('bcrypt');

const UserReportRepository = require('../repositories/user.report.repository');
const UserRepository = require('../repositories/user.repository');

const reportUser = async (reportedUsername, reason, userId) => {
    try {
        const reportedUserInfo = await UserRepository.findUserById(reportedUsername);
        await UserReportRepository.reportUser(reportedUserInfo.id, reason, userId);
    } catch (error) {
        return { error: error.message };
    }
}

module.exports = {
    reportUser,
};
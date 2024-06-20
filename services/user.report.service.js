const bcrypt = require('bcrypt');

const userReportRepository = require('../repositories/user.report.repository');
const userRepository = require('../repositories/user.repository');

const reportUser = async (reportedUsername, reason, userId) => {
    try {
        const reportedUserInfo = await userRepository.findUserByUsername(reportedUsername);
        if (!reportedUserInfo) {
            const error = new Error('Report user not found.');
            error.status = 404;
            throw error;
        }
        await userReportRepository.reportUser(reportedUserInfo.id, reason, userId);
        //TODO: 유저 신고 시 차단 기능 추가 논의
    } catch (error) {
        return { error: error.message };
    }
}

module.exports = {
    reportUser,
};
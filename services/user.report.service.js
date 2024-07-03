const userReportRepository = require('../repositories/user.report.repository');
const userRepository = require('../repositories/user.repository');

const logger = require('../configs/logger');

const reportUser = async (reportedUsername, reason, userId) => {
    try {
        logger.info('user.report.service.js reportUser: ' + reportedUsername + ', ' + reason + ', ' + userId);
        const reportedUserInfo = await userRepository.findUserByUsername(reportedUsername);
        if (!reportedUserInfo) {
            const error = new Error('Report user not found.');
            error.status = 404;
            throw error;
        }
        await userReportRepository.reportUser(reportedUserInfo.id, reason, userId);
        //TODO: 유저 신고 시 차단 기능 추가 논의
    } catch (error) {
        logger.error('user.report.service.js reportUser: ' + error.message);
        throw error;
    }
}

module.exports = {
    reportUser,
};
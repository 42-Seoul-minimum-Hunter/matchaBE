const bcrypt = require('bcrypt');

const UserReportRepository = require('../repositories/user.report.repository');

const reportUser = async (report, userId) => {
    try {
        await UserReportRepository.reportUser(report, userId);
    } catch (error) {
        return { error: error.message };
    }
}

module.exports = {
    reportUser,
};
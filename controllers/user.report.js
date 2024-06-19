const express = require('express');
const router = express.Router();
const { verifyAllprocess } = require('../configs/middleware.js');

const userReportSerivce = require('../services/user.report.service.js');


/* POST /user/report
reportedUsername : String 신고 대상 사용자 닉네임
reason : String(ENUM) 신고 사유
*/

router.post('/', async function (req, res, next) {
    try {
        const reportedUsername = req.body.reportedUsername;
        const reason = req.body.reason;
        if (!reportedUsername || !reason) {
            return res.status(400).send('reportedUsername, reason를 입력하세요.');
        }
        const report = {
            reportedUsername: reportedUsername,
            reason: reason
        };

        await userReportSerivce.reportUser(report, req.user.id);
        res.send();
    } catch (error) {
        next(error);
    }

});

module.exports = router;
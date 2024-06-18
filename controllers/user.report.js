var express = require('express');
var router = express.Router();

var userReportSerivce = require('../services/user.report.service.js');


/* POST /user/report
reportedUsername : String 신고 대상 사용자 닉네임
reason : String(ENUM) 신고 사유
*/

router.post('/', async function (req, res, next) {
    try {
        const reportedUsername = req.body.reportedUsername;
        const reason = req.body.reason;
        if (reportedUsername === undefined || reason === undefined) {
            return res.status(400).send('reportedUsername, reason를 입력하세요.');
        }
        const report = {
            reportedUsername: reportedUsername,
            reason: reason
        };
        //TODO: id 매직넘버 제거
        await userReportSerivce.reportUser(report, 4);
        res.send();
    } catch (error) {
        next(error);
    }

});

module.exports = router;
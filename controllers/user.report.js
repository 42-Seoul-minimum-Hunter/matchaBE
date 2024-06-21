const express = require('express');
const router = express.Router();
const { verifyAllprocess } = require('../configs/middleware.js');

const userReportSerivce = require('../services/user.report.service.js');


/* POST /user/report
reportedUsername : String 신고 대상 사용자 닉네임
reason : String(ENUM) 신고 사유
*/

//TODO: jwt 토큰 확인 추가
//TODO: reason ENUM 확인
//TODO: 신고 시 사용자 차단 추가
router.post('/', async function (req, res, next) {
    try {
        const { reportedUsername, reason } = req.body;
        if (!reportedUsername || !reason) {
            return res.status(400).send('reportedUsername, reason를 입력하세요.');
        }

        await userReportSerivce.reportUser(reportedUsername, reason, req.jwtInfo.id);
        res.send();
    } catch (error) {
        next(error);
    }

});

module.exports = router;
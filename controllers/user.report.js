var express = require('express');
var router = express.Router();

var userSerivce = require('../services/user.service.js');


/* POST /user/report
userId : String 사용자 식별자
reported_username : String 신고 대상 사용자 닉네임
reason : String(ENUM) 신고 사유
*/

router.post('/', function (req, res, next) {
    this.logger.info('POST /user/report');

    try {
        var userId = req.body.userId;
        var reported_username = req.body.reported_username;
        var reason = req.body.reason;
        if (userId === undefined || reported_username === undefined || reason === undefined) {
            throw new Error('userId, reported_username, reason를 입력하세요.');
        }
        var report = {
            userId: userId,
            reported_username: reported_username,
            reason: reason
        };
        userSerivce.reportUser(report);
        res.send(report);
    } catch (error) {
        res.send('사용자를 신고할 수 없습니다.');
    }

});

module.exports = router;
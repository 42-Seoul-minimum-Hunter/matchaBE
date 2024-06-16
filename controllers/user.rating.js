var express = require('express');
var router = express.Router();

var userSerivce = require('../services/user.service.js');

/* POST /user/rate
userId : String 사용자 식별자
rated_username : String 평가 대상사용자 닉네임
rate_score : Float 평가 점수
*/
router.post('/', function (req, res, next) {
    this.logger.info('POST /user/rate');

    try {
        var userId = req.body.userId;
        var rated_username = req.body.rated_username;
        var rate_score = req.body.rate_score;
        if (userId === undefined || rated_username === undefined || rate_score === undefined) {
            throw new Error('userId, rated_username, rate_score를 입력하세요.');
        } else if (rate_score < 0 || rate_score > 5) {
            var rate = {
                userId: userId,
                rated_username: rated_username,
                rate_score: rate_score
            };
            userSerivce.rateUser(rate);
            res.send(rate);
        }
    } catch (error) {
        res.send('사용자를 신고할 수 없습니다.');
    }
});

module.exports = router;
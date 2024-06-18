var express = require('express');
var router = express.Router();

var userRateSerivce = require('../services/user.rate.service.js');

/* POST /user/rate
rated_username : String 평가 대상사용자 닉네임
rate_score : Float 평가 점수
*/
router.post('/', function (req, res, next) {
    try {
        var rated_username = req.body.rated_username;
        var rate_score = req.body.rate_score;
        if (rated_username === undefined || rate_score === undefined) {
            return res.status(400).send('rated_username, rate_score를 입력하세요.');
        } else if (rate_score < 0.0 || rate_score > 5.0) {
            return res.status(400).send('rate_score는 0에서 5 사이의 값을 입력하세요.');
        } else {
            var rate = {
                rated_username: rated_username,
                rate_score: rate_score
            };
            //TODO: id 매직넘버 제거
            userRateSerivce.rateUser(rate, 4);
            res.send(rate);
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;
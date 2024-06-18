var express = require('express');
var router = express.Router();

var userRateSerivce = require('../services/user.rate.service.js');

/* POST /user/rate
ratedUsername : String 평가 대상사용자 닉네임
rateScore : Float 평가 점수
*/
router.post('/', function (req, res, next) {
    try {
        var ratedUsername = req.body.ratedUsername;
        var rateScore = req.body.rateScore;
        if (ratedUsername === undefined || rateScore === undefined) {
            return res.status(400).send('ratedUsername, rateScore를 입력하세요.');
        } else if (rateScore < 0.0 || rateScore > 5.0) {
            return res.status(400).send('rateScore는 0에서 5 사이의 값을 입력하세요.');
        } else {
            var rate = {
                ratedUsername: ratedUsername,
                rateScore: rateScore
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
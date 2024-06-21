const express = require("express");
const router = express.Router();
const { verifyAllprocess } = require("../configs/middleware.js");

const userRateSerivce = require("../services/user.rate.service.js");

/* POST /user/raㅈString 평가 대상사용자 닉네임
rateScore : Float 평가 점수
*/

//TODO: jwt 토큰 확인 추가
//TODO: 정밀도 소수점 1자리
router.post("/", async function (req, res, next) {
  try {
    const ratedUsername = req.body.ratedUsername;
    var rateScore = req.body.rateScore;
    if (!ratedUsername || !rateScore) {
      return res.status(400).send("ratedUsername, rateScore를 입력하세요.");
    } else if (rateScore < 0.0 || rateScore > 5.0) {
      return res
        .status(400)
        .send("rateScore는 0에서 5 사이의 값을 입력하세요.");
    } else {
      await userRateSerivce.rateUser(
        ratedUsername,
        parseFloat(rateScore),
        req.jwtInfo.id
      );
      return res.send();
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;

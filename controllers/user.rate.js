const express = require("express");
const router = express.Router();
const { verifyAllprocess } = require("../configs/middleware.js");

const userRateSerivce = require("../services/user.rate.service.js");

const logger = require("../configs/logger.js");

/* POST /user/rate
ratedUsername 평가 대상사용자 닉네임
rateScore : Float 평가 점수
*/

router.post("/", verifyAllprocess, async function (req, res, next) {
  try {
    logger.info("user.rate.js POST /user/rate: " + JSON.stringify(req.body));
    const ratedUsername = req.body.ratedUsername;
    var rateScore = req.body.rateScore;
    if (!ratedUsername || rateScore === undefined) {
      return res.status(400).send("Please enter ratedUsername and rateScore");
    } else if (rateScore < 0.0 || rateScore > 5.0) {
      return res.status(400).send("Rate score must be between 0.0 and 5.0");
    } else {
      const rateAvg = await userRateSerivce.rateUser(
        ratedUsername,
        parseFloat(rateScore),
        req.jwtInfo.id
      );

      return res.send({ rateAvg });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;

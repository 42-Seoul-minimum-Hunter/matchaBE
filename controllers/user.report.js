const express = require("express");
const router = express.Router();
const logger = require("../configs/logger.js");
const { verifyAllprocess } = require("../configs/middleware.js");

const userReportSerivce = require("../services/user.report.service.js");

/* POST /user/report
reportedUsername : String 신고 대상 사용자 닉네임
reason : String(ENUM) 신고 사유
*/

//TODO: reason ENUM 확인
//TODO: 신고 시 사용자 차단 추가
router.post("/", async function (req, res, next) {
  try {
    logger.info(
      "user.report.js POST /user/report: " + JSON.stringify(req.body)
    );
    const { reportedUsername, reason } = req.body;
    if (!reportedUsername || !reason) {
      return res.status(400).send("reportedUsername, reason를 입력하세요.");
    }

    //await userReportSerivce.reportUser(
    //  reportedUsername,
    //  reason,
    //  req.jwtInfo.id
    //);
    await userReportSerivce.reportUser(reportedUsername, reason, 701);
    return res.send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;

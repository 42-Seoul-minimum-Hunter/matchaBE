const express = require("express");
const router = express.Router();
const logger = require("../configs/logger.js");
const { verifyAllprocess } = require("../configs/middleware.js");

const userReportSerivce = require("../services/user.report.service.js");

/* POST /user/report
reportedUsername : String 신고 대상 사용자 닉네임
*/

router.post("/", verifyAllprocess, async function (req, res, next) {
  try {
    logger.info(
      "user.report.js POST /user/report: " + JSON.stringify(req.body)
    );
    const { reportedUsername } = req.body;
    if (!reportedUsername) {
      return res.status(400).send("reportedUsername is required");
    }

    await userReportSerivce.reportUser(reportedUsername, req.jwtInfo.id);
    return res.send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;

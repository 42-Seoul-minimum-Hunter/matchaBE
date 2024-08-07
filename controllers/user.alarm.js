const express = require("express");
const router = express.Router();
const { verifyAllprocess } = require("../configs/middleware.js");

const userAlarmSerivce = require("../services/user.alarm.service.js");
const logger = require("../configs/logger.js");

/* GET /user/alarm
 */
router.get("/", verifyAllprocess, async function (req, res, next) {
  try {
    logger.info("user.alarm.js GET /user/alarm");

    const id = req.jwtInfo.id;
    const alarms = await userAlarmSerivce.findAllAlarmsById(id);
    return res.send(alarms);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

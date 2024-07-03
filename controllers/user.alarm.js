const express = require('express');
const router = express.Router();
const { verifyAllprocess } = require('../configs/middleware.js');

const userAlarmSerivce = require('../services/user.alarm.service.js');
const logger = require('../configs/logger.js');

/* GET /user/alarm
*/
//TODO: verifyAllprocess 미들웨어 추가
router.get('/', verifyAllprocess, async function (req, res, next) {
    try {
        logger.info("user.alarm.js GET /user/alarm")
        const id = req.jwtInfo.id;
        const alarms = await userAlarmSerivce.getAlarmsById(id);
        return res.send(alarms);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
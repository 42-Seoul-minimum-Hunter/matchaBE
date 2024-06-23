const express = require('express');
const router = express.Router();
const { verifyAllprocess } = require('../configs/middleware.js');

const userAlarmSerivce = require('../services/user.alarm.service.js');

/* GET /user/alarm
*/
//TODO: verifyAllprocess 미들웨어 추가
router.get('/', async function (req, res, next) {
    try {
        const id = req.jwtInfo.id;
        const alarms = await userAlarmSerivce.getAlarmsById(id);
        return res.send(alarms);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
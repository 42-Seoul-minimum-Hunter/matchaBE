const express = require("express");
const router = express.Router();
const logger = require("../configs/logger.js");
const { verifyAllprocess } = require("../configs/middleware.js");

const userChatSerivce = require("../services/user.chat.service.js");

/* GET /user/chatRoom
 */
router.get("/", async function (req, res, next) {
  try {
    logger.info("user.chat.js GET /user/chatRoom");
    //const id = req.jwtInfo.id;
    //임시 id로 테스트
    const id = 701;

    const chatInfo = await userChatSerivce.findAllChatRooms(id);
    return res.send(chatInfo);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

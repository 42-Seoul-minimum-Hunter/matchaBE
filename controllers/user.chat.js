const express = require("express");
const router = express.Router();
const { verifyAllprocess } = require("../configs/middleware.js");

const userChatSerivce = require("../services/user.chat.service.js");

/* GET /user/chat

*/
router.get("/", async function (req, res, next) {
  try {
    const chatInfo = await userChatSerivce.getChatInfo(req.jwtInfo.id);
    return res.send(chatInfo);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

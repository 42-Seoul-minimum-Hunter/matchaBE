const express = require("express");
const router = express.Router();
const { verifyAllprocess } = require("../configs/middleware.js");

const userChatSerivce = require("../services/user.chat.service.js");

/* GET /user/chat

*/
router.get("/", verifyAllprocess, async function (req, res, next) {
  try {
    const id = req.query.id;
    if (!id) {
      return res.status(400).send("id is required");
    }
    //const chatInfo = await userChatSerivce.getChatInfo(req.jwtInfo.id);
    const chatInfo = await userChatSerivce.getChatInfo(parseInt(id));
    return res.send(chatInfo);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

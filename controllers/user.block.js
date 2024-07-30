const express = require("express");
const router = express.Router();
const logger = require("../configs/logger.js");
const { verifyAllprocess } = require("../configs/middleware.js");

const userBlockSerivce = require("../services/user.block.service.js");

/* POST /user/block
blockUsername : String 차단 대상사용자 닉네임
*/

router.post("/", async function (req, res, next) {
  try {
    logger.info("user.block.js POST /user/block");
    const blockUsername = req.body.blockUsername;
    if (!blockUsername) {
      return res.status(400).send("blockUsername is required.");
    } else {
      //await userBlockSerivce.addBlockUser(blockUsername, req.jwtInfo.id);
      //임시 id로 테스트
      await userBlockSerivce.addBlockUser(blockUsername, 701);
      return res.send();
    }
  } catch (error) {
    next(error);
  }
});

/* DELETE /user/block
blockUsername : String 차단 대상사용자 닉네임
*/

router.delete("/", async function (req, res, next) {
  try {
    logger.info("user.block.js DELETE /user/block");
    const blockUsername = req.body.blockUsername;
    if (!blockUsername) {
      return res.status(400).send("blockUsername is required.");
    } else {
      //await userBlockSerivce.deleteBlockUser(blockUsername, req.jwtInfo.id);
      //임시 id로 테스트
      await userBlockSerivce.deleteBlockUser(blockUsername, 701);
      return res.send();
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;

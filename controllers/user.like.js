const express = require('express');
const router = express.Router();
const { verifyAllprocess } = require('../configs/middleware.js');

const userLikeSerivce = require('../services/user.like.service.js');

/* POST /user/like
likeUsername : String 좋아요 대상 사용자 닉네임
*/

//TODO: verifyAllprocess 미들웨어 추가
router.post('/', async function (req, res, next) {
    try {
        const likeUsername = req.body.likeUsername;
        if (!likeUsername) {
            return res.status(400).send('likeUsername을 입력하세요.');
        } else {
            await userLikeSerivce.addLikeUserByUsername(likeUsername, req.jwtInfo.id);
            res.send();
        }
    } catch (error) {
        next(error);
    }
});

/* DELETE /user/like
likeUsername : String 좋아요 대상 사용자 닉네임
*/

//TODO: verifyAllprocess 미들웨어 추가
router.delete('/', async function (req, res, next) {
    try {
        const likeUsername = req.body.likeUsername;
        if (!likeUsername) {
            return res.status(400).send('likeUsername을 입력하세요.');
        } else {
            await userLikeSerivce.deleteLikeUserByUsername(likeUsername, req.jwtInfo.id);
            res.send();
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;
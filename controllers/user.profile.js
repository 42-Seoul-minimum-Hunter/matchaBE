var express = require('express');
var router = express.Router();

var userSerivce = require('../services/user.service.js');

/* GET /user/profile/:username
username : String 사용자 닉네임
*/
router.get('/:username', function (req, res, next) {
    this.logger.info('GET /user/create/:username');
    try {
        if (req.params.username === undefined) {
            res.send('사용자 닉네임을 입력하세요.');
            return;
        }
        var username = req.params.username;
        var user = userSerivce.findUserByUsername(username);
        res.send(user);
    } catch
    (error) {
        res.send('사용자를 생성할 수 없습니다.');
    }
});

/* GET /user/me/
*/
router.get('/me', function (req, res, next) {
    this.logger.info('GET /user/me');
    try {
        var user = userSerivce.getMe();
        res.send(user);
    } catch (error) {
        res.send('사용자를 찾을 수 없습니다.');
    }
});


/* POST /user/update/photo
id : String 사용자 식별자
photoOne : String 사용자 사진
photoTwo : String 사용자 사진
photoThree : String 사용자 사진
photoFour : String 사용자 사진
photoFive : String 사용자 사진
*/

router.post('/update/photo', function (req, res, next) {
    this.logger.info('POST /user/update/photo');
    try {
        var id = req.body.id;
        var photoOne = req.body.photoOne;
        var photoTwo = req.body.photoTwo;
        var photoThree = req.body.photoThree;
        var photoFour = req.body.photoFour;
        var photoFive = req.body.photoFive;
        if (id === undefined) {
            throw new Error('id를 입력하세요.');
        }
        var user = userSerivce.updatePhoto(id, photoOne, photoTwo, photoThree, photoFour, photoFive);
        res.send(user);
    } catch (error) {
        res.send('사용자 사진을 변경할 수 없습니다.');
    }
});

module.exports = router;
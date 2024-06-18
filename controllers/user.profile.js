var express = require('express');
var router = express.Router();

var userProfileService = require('../services/user.profile.service.js');

/* GET /user/profile/
username : String 사용자 닉네임
*/
router.get('/', async function (req, res, next) {
    try {
        const username = req.query.username;
        if (username === undefined) {
            return res.status(400).send('사용자 닉네임을 입력하세요.');
        }
        let user = await userProfileService.findUserByUsername(username, 3);
        res.send(user);
    } catch (error) {
        next(error);
    }
});

/* GET /user/me/
*/
router.get('/me', function (req, res, next) {
    try {
        let user = userProfileService.getMe(3);
        res.send(user);
    } catch (error) {
        next(error);
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
        var user = userProfileService.updatePhoto(id, photoOne, photoTwo, photoThree, photoFour, photoFive);
        res.send(user);
    } catch (error) {
        res.send('사용자 사진을 변경할 수 없습니다.');
    }
});

module.exports = router;
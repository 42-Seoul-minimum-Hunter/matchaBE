const express = require('express');
const router = express.Router();
const { verifyAllprocess } = require('../configs/middleware.js');

const userProfileService = require('../services/user.profile.service.js');

/* GET /user/profile/
username : String 사용자 닉네임
*/
router.get('/', verifyAllprocess, async function (req, res, next) {
    try {
        const username = req.query.username;
        if (username === undefined) {
            return res.status(400).send('사용자 닉네임을 입력하세요.');
        }
        //TODO: id 매직넘버 제거
        let user = await userProfileService.findUserByUsername(username, req.jwtInfo.id);
        res.send(user);
    } catch (error) {
        next(error);
    }
});

/* GET /user/profile/me/
*/
router.get('/me', verifyAllprocess, async function (req, res, next) {
    try {
        const user = await userProfileService.getMyInfo(req.jwtInfo.id);
        res.send(user);
    } catch (error) {
        next(error);
    }
});

/* PUT /user/profile/update
id : Number 사용자 id
email : String 사용자 이메일
password : String 사용자 비밀번호 => hash로 변환 예정
lastName : String 사용자 이름
firstName : String 사용자 성
gender : String 사용자 성별
preference : String 사용자 성적취향
biography : String 사용자 자기소개
age : Number 사용자 나이
gpsAllowedAt : Boolean GPS 사용 허용 여부 => Date로 반환 예정
isOAuth : Boolean OAuth 사용 여부
hastags : Object 사용자 해시태그
region : Object 사용자 위치
profileImages : String 사용자 프로필 이미지 => BASE64로 반환 예정
}
*/

router.put('/update', verifyAllprocess, function (req, res, next) {
    try {
        const user = {
            id: req.jwtInfo.id,
            email: req.jwtInfo.email,
            password: req.body.password,
            lastName: req.body.lastName,
            firstName: req.body.firstName,
            gender: req.body.gender,
            preference: req.body.preference,
            biography: req.body.biography,
            age: req.body.age,
            gpsAllowedAt: req.body.gpsAllowedAt,
            isOAuth: req.body.isOAuth,
            hashtags: req.body.hashtags,
            region: req.body.region,
            profileImages: req.body.profileImages
        }
        //TODO : id magic number 제거
        userProfileService.updateUser(user);
        res.send();
    } catch (error) {
        next(error);
    }
});


module.exports = router;
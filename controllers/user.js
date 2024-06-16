const express = require('express');
const router = express.Router();
const morgan = require('morgan');

const userSerivce = require('../services/user.service.js');
const { postrgres } = require('../configs/database');

const UserService = require('../services/user.service.js');
const UserCreateDto = require('../dtos/user.create.dto.js');

morgan('combined', {
    skip: function (request, response) { return response.statusCode < 400 }
})

/* POST /user/create
email : String 사용자 이메일
username : String 사용자 닉네임
password : String 사용자 비밀번호 => hash로 변환 예정
lastName : String 사용자 이름
firstName : String 사용자 성
gender : String 사용자 성별
preference : String 사용자 성적취향
biography : String 사용자 자기소개
age : Number 사용자 나이
gpsAllowedAt : Boolean GPS 사용 허용 여부 => Date로 반환 예정
hastag : Object 사용자 해시태그
region : Object 사용자 위치
profileImages : String 사용자 프로필 이미지 => BASE64로 반환 예정
}
*/

router.post('/create', function (req, res, next) {
    //this.logger.info('POST /user/create');
    try {
        //var user = new UserCreateDto(req.body);

        const user = {
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            lastName: req.body.lastName,
            firstName: req.body.firstName,
            gender: req.body.gender,
            preference: req.body.preference,
            biography: req.body.biography,
            age: req.body.age,
            gpsAllowedAt: req.body.gpsAllowedAt,
            hashtags: req.body.hashtags,
            region: req.body.region,
            profileImages: req.body.profileImages
        }
        const { error, user_id } = userSerivce.createUser(user);
        if (error) {
            return res.status(400).send(error);
        }
        user.id = user_id;
        res.send(user);
    } catch (error) {
        next(error);
    }
});

/* DELETE /user/delete
*/

router.delete('/delete', async function (req, res, next) {
    try {
        //TODO : id magic number 제거
        const error = await userSerivce.deleteUser(8);
        if (error) {
            console.log("controller");
            return res.status(400).send(error);
        }
        res.send();
    } catch (error) {
        next(error);
    }
});


//세션으로 변경 가능 여부 확인
/* POST /user/change/password
password : String 사용자 비밀번호
*/
router.post('/change/password', function (req, res, next) {
    //morgan.info('POST /user/change/password');
    try {
        var user = userSerivce.changePassword();
        res.send(user);
    } catch (error) {
        res.send('비밀번호를 변경할 수 없습니다.');
    }
});


/* GET /user/find
username : String 사용자 닉네임
hashtag : String 사용자 해시태그
age : Number 사용자 나이
rate : Number 사용자 평점
*/

//age min max
router.get('/find', function (req, res, next) {
    this.logger.info('GET /user/find');
    try {
        let { username, hashtag, age, rate } = req.query;

        let filter = {
            username,
            hashtag,
            age,
            rate
        }
        var userInfos = userSerivce.findUserByUsername(filter);
        res.send(userInfos);
    } catch (error) {
        res.status(404).send('사용자를 찾을 수 없습니다.');
    }
});


/* PUT /user/update
email : String 사용자 이메일
username : String 사용자 닉네임
password : String 사용자 비밀번호
last_name : String 사용자 이름
first_name : String 사용자 성
gender : String 사용자 성별
preference : String 사용자 성적취향
age : Number 사용자 나이
gps_allowed_at : Boolean GPS 사용 허용 여부 => Date로 반환 예정
*/

router.put('/update', function (req, res, next) {
    this.logger.info('PATCH /user/update');
    try {
        var user = {
            id: req.body.id,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            last_name: req.body.last_name,
            first_name: req.body.first_name,
            gender: req.body.gender,
            preference: req.body.preference,
            age: req.body.age,
            gps_allowed_at: req.body.gps_allowed_at
        };
        userSerivce.updateUser(user);
        res.send(user);
    } catch (error) {
        res.send('사용자 정보를 수정할 수 없습니다.');
    }
});


router.get('/location/:id', function (req, res, next) {
    this.logger.info('GET /user/location');
    try {
        var id = req.params.id;
        var location = userSerivce.getLocation(id);
        res.send(location);
    } catch (error) {
        res.send('사용자 위치를 찾을 수 없습니다.');
    }
});

module.exports = router;
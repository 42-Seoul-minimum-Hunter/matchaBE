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
        let { error, user_id } = userSerivce.createUser(user);
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
        let error = await userSerivce.deleteUser(22);
        if (error) {
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
    try {

        let password = req.body.password;
        if (!password) {
            return res.status(400).send('비밀번호를 입력해주세요.');
        }
        //TODO : id magic number 제거
        userSerivce.changePassword(password, 22);
        res.send();
    } catch (error) {
        next(error);
    }
});


/* GET /user/find
username : String 사용자 닉네임
hashtags : String 사용자 해시태그
minAge : Number 사용자 최소 나이
maxAge : Number 사용자 최대 나이
minRate : Number 사용자 평점
maxRate : Number 사용자 평점
*/

router.get('/find', function (req, res, next) {
    try {
        let { username, hashtags, minAge, maxAge, minRate, maxRate } = req.query;

        const filter = {
            username,
            hashtags: hashtags || undefined,
            minAge: minAge ? Number(minAge) : undefined,
            maxAge: maxAge ? Number(maxAge) : undefined,
            minRate: minRate ? Number(minRate) : undefined,
            maxRate: maxRate ? Number(maxRate) : undefined
        };
        if (minAge && maxAge && minAge > maxAge) {
            return res.status(400).send('최소 나이가 최대 나이보다 큽니다.');
        } else if (minAge && minAge < 0) {
            return res.status(400).send('최소 나이가 0보다 작습니다.');
        } else if (minRate && maxRate && minRate > maxRate) {
            return res.status(400).send('최소 평점이 최대 평점보다 큽니다.');
        }

        const userInfos = userSerivce.findUserByUsername(filter);
        res.send(userInfos);
    } catch (error) {
        next(error);
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
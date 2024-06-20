const express = require('express');
const router = express.Router();
const { verifyAllprocess } = require('../configs/middleware.js');

const userProfileService = require('../services/user.profile.service.js');

/* GET /user/profile/
username : String 사용자 닉네임
*/
router.get('/', async function (req, res, next) {
    try {
        const username = req.query.username;
        if (!username) {
            return res.status(400).send('사용자 닉네임을 입력하세요.');
        }
        const user = await userProfileService.getUserProfile(username, req.jwtInfo.id);
        res.send(user);
    } catch (error) {
        next(error);
    }
});

/* GET /user/profile/me/
*/
router.get('/me', async function (req, res, next) {
    try {
        const user = await userProfileService.getMyInfo(req.jwtInfo.id);
        res.send(user);
    } catch (error) {
        next(error);
    }
});

/* PUT /user/profile/update
email : String 사용자 이메일
password : String 사용자 비밀번호 => hash로 변환 예정
lastName : String 사용자 이름
firstName : String 사용자 성
gender : String 사용자 성별
preference : String 사용자 성적취향
biography : String 사용자 자기소개
age : Number 사용자 나이
gpsAllowedAt : Boolean GPS 사용 허용 여부 => Date로 반환 예정
hastags : Object 사용자 해시태그
region : Object 사용자 위치
profileImages : String 사용자 프로필 이미지 => BASE64로 반환 예정
}
*/

router.put('/update', async function (req, res, next) {
    try {
        const user = {
            email: req.body.email,
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

        if (!user.email || !user.password || !user.lastName ||
            !user.firstName || !user.gender ||
            !user.preference || !user.biography ||
            !user.age || !user.hashtags ||
            !user.region || !user.profileImages) {
            return res.status(400).send('모든 항목을 입력해주세요.');
        } else if (user.gpsAllowedAt === undefined) {
            return res.status(400).send('GPS 사용 허용 여부를 입력해주세요.');
        }
        else if (user.profileImages.length > 5 && user.profileImages.length < 1) {
            return res.status(400).send('프로필 이미지는 최대 5개까지만 등록할 수 있습니다.');
        } else if (user.hashtags.length > 5 && user.hashtags.length < 1) {
            return res.status(400).send('해시태그는 최대 5개까지만 등록할 수 있습니다.');
        } else if (user.email !== req.jwtInfo.email && req.jwtInfo.isOauth === true) {
            return res.status(400).send('소셜 로그인 사용자는 이메일을 변경할 수 없습니다.');
        }

        await userProfileService.updateUser(user);

        if (user.email !== req.jwtInfo.email) {
            const jwtToken = authService.generateJWT({
                id: req.jwtInfo.id,
                email: user.email,
                isValid: user.isValid,
                isOauth: req.jwtInfo.isOauth,
                accessToken: req.jwtInfo.accessToken,
                twofaVerified: req.jwtInfo.twofaVerified
            });

            res = authService.setJwtOnCookie(res, jwtToken);
        }
        res.send();
    } catch (error) {
        next(error);
    }
});


module.exports = router;
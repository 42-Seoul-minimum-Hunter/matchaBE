const express = require('express');
const router = express.Router();
const morgan = require('morgan');

const { checkOauthLogin, verifyAllprocess } = require('../configs/middleware.js');

const userSerivce = require('../services/user.service.js');

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
hashtags : Object 사용자 해시태그
region : Object 사용자 위치
profileImages : String 사용자 프로필 이미지 => BASE64로 반환 예정
}
*/

router.post('/create', checkOauthLogin, async function (req, res, next) {
    try {
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

        if (!user.email || !user.username ||
            !user.password || !user.lastName ||
            !user.firstName || !user.gender ||
            !user.preference || !user.biography ||
            !user.age || !user.hashtags ||
            !user.region || !user.profileImages) {
            return res.status(400).send('모든 항목을 입력해주세요.');
        } else if (user.gpsAllowedAt === undefined) {
            return res.status(400).send('GPS 사용 허용 여부를 입력해주세요.');
        }
        else if (user.profileImages.length > 5) {
            return res.status(400).send('프로필 이미지는 최대 5개까지만 등록할 수 있습니다.');
        } else if (user.hashtags.length > 5) {
            return res.status(400).send('해시태그는 최대 5개까지만 등록할 수 있습니다.');
        }

        const user_id = await userSerivce.createUser(user);

        if (error) {
            return res.status(400).send(error);
        }
        user.id = user_id;

        let jwtToken;

        if (req.jwtInfo && req.jwtInfo.isOauth && req.jwtInfo.accessToken) {
            jwtToken = authService.generateJWT({
                id: user.id,
                email: user.email,
                isValid: true,
                isOauth: true,
                accessToken: req.jwtInfo.accessToken,
                twofaVerified: false
            });
            user.isOauth = true;
        } else {
            jwtToken = authService.generateJWT({
                id: user.id,
                email: user.email,
                isValid: false,
                isOauth: false,
                accessToken: null,
                twofaVerified: false
            });
            user.isOauth = false;
        }

        // JWT 토큰을 쿠키에 담기
        res.cookie('jwt', jwtToken, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        // JWT 토큰을 응답 헤더에 담기
        res.set('Authorization', `Bearer ${jwtToken}`);

        res.send(user);
    } catch (error) {
        next(error);
    }
});

/* DELETE /user/delete
*/

router.delete('/delete', async function (req, res, next) {
    try {
        await userSerivce.deleteUser(req.jwtInfo.id);
        res.clearCookie('jwt');
        res.send();
    } catch (error) {
        next(error);
    }
});


//세션으로 변경 가능 여부 확인
/* POST /user/change/password
password : String 사용자 비밀번호
*/
router.post('/change/password', async function (req, res, next) {
    try {
        let password = req.body.password;

        if (!password) {
            return res.status(400).send('비밀번호를 입력해주세요.');
        }

        const { email, expirationDate } = req.session.resetPassword;
        if (expirationDate < new Date()) {
            return res.status(400).send('비밀번호 변경 기간이 만료되었습니다.');
        }

        const resultUserInfo = await userSerivce.changePassword(password, email);
        res.send(resultUserInfo);
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
si : String 사용자 시
gu : String 사용자 구
*/

router.get('/find', async function (req, res, next) {
    try {
        let { username, hashtags, minAge, maxAge, minRate, maxRate, si, gu } = req.query;

        const filter = {
            username: username || undefined,
            hashtags: hashtags || undefined,
            minAge: minAge ? Number(minAge) : undefined,
            maxAge: maxAge ? Number(maxAge) : undefined,
            minRate: minRate ? Number(minRate) : undefined,
            maxRate: maxRate ? Number(maxRate) : undefined,
            si: si || undefined,
            gu: gu || undefined
        };
        if (minAge && maxAge && minAge > maxAge) {
            return res.status(400).send('최소 나이가 최대 나이보다 큽니다.');
        } else if (minAge && minAge < 0) {
            return res.status(400).send('최소 나이가 0보다 작습니다.');
        } else if (minRate && maxRate && minRate > maxRate) {
            return res.status(400).send('최소 평점이 최대 평점보다 큽니다.');
        } else if (si === undefined && gu !== undefined) {
            return res.status(400).send('시를 입력해주세요.');
        }

        const UserInfos = await userSerivce.findUserByFilter(filter);
        res.send(UserInfos);
    } catch (error) {
        next(error);
    }
});


/* GET /user/search/region
*/

router.get('/search/region', function (req, res, next) {
    try {
        let region = userSerivce.getRegion(req.jwtInfo.id);
        res.send(region);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
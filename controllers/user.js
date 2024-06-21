const express = require('express');
const router = express.Router();
const morgan = require('morgan');

const { checkOauthLogin, verifyAllprocess } = require('../configs/middleware.js');

const userSerivce = require('../services/user.service.js');
const authService = require('../services/auth.service.js');

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


//TODO: jwt 토큰 확인 추가
//TODO: username, password 정규표현식, email 형식 확인, biography 정규표현식
//TODO: region si, gu 존재 확인, 올바른 시, 구인지 확인
//TODO: 이미지 형식 확인
//TODO: 해시태그 형식 확인
router.post('/create', checkOauthLogin, async function (req, res, next) {
    try {
        const user = {
            email: req.body.email || undefined,
            username: req.body.username || undefined,
            password: req.body.password || undefined,
            lastName: req.body.lastName || undefined,
            firstName: req.body.firstName || undefined,
            gender: req.body.gender || undefined,
            preference: req.body.preference || undefined,
            biography: req.body.biography || undefined,
            age: req.body.age || undefined,
            gpsAllowedAt: req.body.gpsAllowedAt || undefined,
            hashtags: req.body.hashtags || undefined,
            region: req.body.region || undefined,
            profileImages: req.body.profileImages || undefined
        }

        if (!user.email || !user.username ||
            !user.password || !user.lastName ||
            !user.firstName || !user.gender ||
            !user.preference || !user.biography ||
            !user.age || !user.hashtags ||
            !user.region || !user.profileImages) {
            return res.status(400).send('모든 항목을 입력해주세요.');
        } else if (user.profileImages.length > 5 && user.profileImages.length < 1) {
            return res.status(400).send('프로필 이미지는 최대 5개까지만 등록할 수 있습니다.');
        } else if (user.hashtags.length > 5 && user.hashtags.length < 1) {
            return res.status(400).send('해시태그는 최대 5개까지만 등록할 수 있습니다.');
        } else if (user.biography.length > 100) {
            return res.status(400).send('자기소개는 100자 이내로 입력해주세요.');
        } else if (user.password.length < 8 && user.password.length > 15) {
            return res.status(400).send('비밀번호는 8자 이상 15자 이하로 입력해주세요.');
        }

        if (req.jwtInfo && req.jwtInfo.isOauth && req.jwtInfo.accessToken) {
            user.isOauth = true;
        } else {
            user.isOauth = false;
        }

        const user_id = await userSerivce.createUser(user);
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

        res.cookie('jwt', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        });

        res.set('Authorization', `Bearer ${jwtToken}`);

        res.send(user);
    } catch (error) {
        next(error);
    }
});

/* DELETE /user/unregister
*/

//TODO: jwt 토큰 확인 추가
router.delete('/unregister', async function (req, res, next) {
    try {
        await userSerivce.unregister(req.jwtInfo.id);
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
        const { email, expirationDate } = req.session.resetPassword;

        if (!password) {
            return res.status(400).send('비밀번호를 입력해주세요.');
        } else if (!email || !expirationDate) {
            return res.status(400).send('비밀번호 변경 요청을 먼저 해주세요.');
        } else if (expirationDate < new Date()) {
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

//TODO: si, gu 올바른 형식인지 확인
//TODO: user preference 필터 추가
//TODO: gu 기준으로 정렬, si 기준으로 정렬 추가
router.get('/find', async function (req, res, next) {
    try {
        let { username, hashtags, minAge, maxAge, minRate, maxRate, si, gu, page = 1, pageSize = 20 } = req.query;

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

        const { users, totalCount } = await userSerivce.findUserByFilter(filter, page, pageSize);
        res.send({ users, totalCount, currentPage: page });
    } catch (error) {
        next(error);
    }
});


/* GET /user/search/region
*/
//TODO: jwt 토큰 확인 추가
//TODO: gpsAllowedAt 확인 상관없이 위치 확인
router.get('/search/region', function (req, res, next) {
    try {
        let region = userSerivce.getRegion(req.jwtInfo.id);
        res.send(region);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
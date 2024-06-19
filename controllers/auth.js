const express = require('express');
const router = express.Router();
const { verifyTwoFA, verifyValid } = require('../configs/middleware.js');
const authService = require('../services/auth.service.js');

/* POST /auth/login
username : String 사용자 닉네임
password : String 사용자 비밀번호
*/

router.post('/login', async function (req, res, next) {
    try {
        if (req.body.username === undefined || req.body.password === undefined) {
            throw new Error('username 또는 password가 없습니다.');
        }
        const username = req.body.username;
        const password = req.body.password;
        const user = await authService.loginByUsernameAndPassword(username, password);

        const jwtToken = authService.generateJWT({
            id: user.id,
            email: user.email,
            isValid: user.isValid,
            isOauth: false,
            accessToken: null,
            twofaVerified: false
        });

        // JWT 토큰을 쿠키에 담기
        res.cookie('jwt', jwtToken, {
            httpOnly: true, // 클라이언트 측 JavaScript에서 접근할 수 없도록 함
            secure: true, // HTTPS 환경에서만 전송되도록 함
            maxAge: 24 * 60 * 60 * 1000 // 쿠키 유효기간 1일
        });

        // JWT 토큰을 응답 헤더에 담기
        res.set('Authorization', `Bearer ${jwtToken}`);

        res.send(user);
    } catch (error) {
        next(error);
    }
});

/* POST /auth/logout
*/

router.post('/logout', function (req, res, next) {
    try {
        res.clearCookie('jwt');
        res.send('로그아웃 되었습니다.');
    } catch (error) {
        next(error);
    }
});

/* GET /auth/callback
code : String OAuth 인증 코드
*/

router.get('/callback', async function (req, res, next) {
    try {
        const code = req.query.code;
        if (code === undefined) {
            return res.status(401).send('code가 없습니다.');
        }

        const { user, oauthInfo } = await authService.findOAuthUser(code);

        if (oauthInfo === undefined) {
            return res.status(401).send('oauth 정보가 없습니다.');
        }

        if (!user) {
            const expirationDate = expirationDate = new Date(Date.now() + 60 * 60 * 1000);
            req.session.registrationVerify = expirationDate;
            res.redirect(process.env.OAUTH_USER_REGISTRATION_URL);
        } else {
            const jwtToken = authService.generateJWT({
                id: user.id,
                email: user.email,
                isValid: user.isValid,
                isOauth: true,
                accessToken: oauthInfo.accessToken,
                twofaVerified: false
            });

            // JWT 토큰을 쿠키에 담기
            res.cookie('jwt', jwtToken, {
                httpOnly: true,
                secure: true,
                maxAge: 24 * 60 * 60 * 1000
            });

            // JWT 토큰을 응답 헤더에 담기
            res.set('Authorization', `Bearer ${jwtToken}`);

            res.send(user);
        }
    } catch (error) {
        next(error);
    }
});

/* POST /auth/twoFactor/create
*/

router.post('/twofactor/create', function (req, res, next) {
    try {
        const email = req.jwtInfo;
        if (!email) {
            res.status(400).send('이메일이 없습니다.');
        }
        authService.createTwofactorCode(req, email);
        res.send();
    } catch (error) {
        next(error);
    }
})

/* POST /auth/twoFactor/verify
code : String 2FA 인증 코드
*/

router.post('/twofactor/verify', async function (req, res, next) {
    try {
        const code = req.body.code;

        if (!email || !code) {
            res.status(400).send('이메일 또는 코드가 없습니다.');
        }
        const result = authService.verifyTwoFactorCode(req, code);

        if (result === false) {
            res.status(400).send('인증번호가 틀렸습니다.');
        } else {
            const jwtToken = authService.generateJWT({
                id: req.jwtInfo.id,
                email: email,
                isValid: req.jwtInfo.isValid,
                isOauth: req.jwtInfo.isOauth,
                accessToken: req.jwtInfo.accessToken,
                twofaVerified: true
            });

            // JWT 토큰을 쿠키에 담기
            res.cookie('jwt', jwtToken, {
                httpOnly: true,
                secure: true,
                maxAge: 24 * 60 * 60 * 1000
            });

            // JWT 토큰을 응답 헤더에 담기
            res.set('Authorization', `Bearer ${jwtToken}`);

            res.send();
        }
    } catch (error) {
        next(error);
    }
});

//https://typo.tistory.com/entry/Nodejs-JQuery-%ED%9A%8C%EC%9B%90%EA%B0%80%EC%9E%85-%EB%A7%8C%EB%93%A4%EA%B8%B0-%EC%9D%B8%EC%A6%9D%EB%B2%88%ED%98%B8-%EC%9D%B4%EB%A9%94%EC%9D%BC-%EC%A0%84%EC%86%A12

/* POST /auth/register/email/send
*/

router.post('/register/email/send', function (req, res, next) {
    try {
        const email = req.jwtInfo;
        if (!email) {
            res.status(400).send('이메일이 없습니다.');
        }
        authService.createRegistURL(req, email);
        res.send();
    } catch (error) {
        next(error);
    }
});

/* POST /auth/register/email/verify
code : String 인증 코드
*/

router.post('/register/email/verify', function (req, res, next) {
    try {
        const code = req.query.code;

        if (!email || !code) {
            res.status(400).send('이메일 또는 코드가 없습니다.');
        }
        const result = authService.verifyRegistURL(req, code);

        if (result === false) {
            res.status(400).send('인증번호가 틀렸습니다.');
        } else {
            res.send();
        }
    } catch (error) {
        next(error);
    }
});



//https://well-made-codestory.tistory.com/37

/* POST /auth/reset/email/create
username : String 사용자 닉네임
email : String 사용자 이메일
*/

router.post('/reset/email/create', async function (req, res, next) {
    try {
        const username = req.body.username;
        const email = req.body.email;
        if (!username || !email) {
            res.status(400).send('이메일 또는 코드가 없습니다.');
        }
        await authService.createResetPasswordURL(req, username, email);
        res.send();
    } catch (error) {
        next(error);
    }
});


//세션으로 인증된 유저라는 것을 확인
/* POST /auth/reset/email/verify
code : String 인증 코드
*/
router.post('/reset/email/verify', function (req, res, next) {
    try {
        const code = req.query.code;
        if (!code) {
            res.status(400).send('코드가 없습니다.');
        }
        authService.verifyResetPasswordURL(req, code);
        //res.redirect(FE_RESET_PASSWORD_URL);
        res.send('redirect');
    } catch (error) {
        next(error);
    }
});

module.exports = router;
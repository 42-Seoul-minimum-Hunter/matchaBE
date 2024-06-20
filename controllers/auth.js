const express = require('express');
const router = express.Router();
const { verifyTwoFA, verifyValid } = require('../configs/middleware.js');
const authService = require('../services/auth.service.js');

/* 일반 회원가입 
1. 회원가입 후 JWT 발급, 쿠키에 담기
        id: user.id,
        email: user.email,
        isValid: false,
        isOauth: false,
        accessToken: null,
        twofaVerified: false

        return user

2. 이메일 인증 후 (세션으로 확인)
        id: user.id,
        email: user.email,
        isValid: true,
        isOauth: false,
        accessToken: null,
        twofaVerified: false

        return 200

3. 2FA 인증 후 (세션으로 확인)
        id: user.id,
        email: user.email,
        isValid: true,
        isOauth: false,
        accessToken: null,
        twofaVerified: true       
        
        return 200
*/

/*OAUTH 회원가입
1. OAUTH 로그인 후 JWT 발급, 쿠키에 담기, 회원가입 페이지로 리다이렉트
    id: null
    email: <oauth email>,
    isValid: true,
    isOauth: true,
    accessToken: <accessToken>,
    twofaVerified: false

    return email

2. 회원가입 후 JWT 발급, 쿠키에 담기
    id: user.id,
    email: user.email,
    isValid: true,
    isOauth: true,
    accessToken: <accessToken>,
    twofaVerified: false

    return user

3. 2FA 인증 후 (세션으로 확인)
    id: user.id,
    email: user.email,
    isValid: true,
    isOauth: true,
    accessToken: <accessToken>,
    twofaVerified: true

    return 200
*/




/* POST /auth/login
username : String 사용자 닉네임
password : String 사용자 비밀번호
*/

router.post('/login', async function (req, res, next) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).send('username or password not found.');
        }

        const user = await authService.loginByUsernameAndPassword(username, password);

        const jwtToken = authService.generateJWT({
            id: user.id,
            email: user.email,
            isValid: user.isValid,
            isOauth: false,
            accessToken: null,
            twofaVerified: false
        });

        res = authService.setJwtOnCookie(res, jwtToken);

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
        if (!code) {
            return res.status(401).send('Code not found.');
        }

        const { user, oauthInfo } = await authService.getOauthInfo(code);

        if (!oauthInfo) {
            return res.status(401).send('oauthInfo not found.');
        }

        let jwtToken = null;
        if (!user) {
            jwtToken = authService.generateJWT({
                id: null,
                email: oauthInfo.email,
                isValid: true,
                isOauth: true,
                accessToken: oauthInfo.accessToken,
                twofaVerified: false
            });

            res = authService.setJwtOnCookie(res, jwtToken);
            res.redirect(process.env.OAUTH_USER_REGISTRATION_URL);
        } else {
            jwtToken = authService.generateJWT({
                id: user.id,
                email: user.email,
                isValid: true,
                isOauth: true,
                accessToken: oauthInfo.accessToken,
                twofaVerified: false
            });

            res = authService.setJwtOnCookie(res, jwtToken);
            res.send(user);
        }
    } catch (error) {
        next(error);
    }
});

/* POST /auth/twoFactor/create
*/
//TODO : verifyTwoFA 추가
router.post('/twofactor/create', function (req, res, next) {
    try {
        //const email = req.jwtInfo.email;
        const email = req.body.email;
        if (!email) {
            res.status(400).send('Email not found.');
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
//TODO : verifyTwoFA 추가
router.post('/twofactor/verify', function (req, res, next) {
    try {
        //const email = req.jwtInfo.email;
        const code = req.body.code;

        const expirationDate = req.session.twoFactorExpirationDate;

        if (!code) {
            return res.status(400).send('Code not found.');
        } else if (!expirationDate) {
            return res.status(401).send('Bad Access.');
        } else if (expirationDate < new Date()) {
            return res.status(400).send('Code expired.');
        }

        const result = authService.verifyTwoFactorCode(expirationDate, code);

        if (result === false) {
            return res.status(400).send('Invalid code.');
        } else {
            const jwtToken = authService.generateJWT({
                id: req.jwtInfo.id,
                email: req.jwtInfo.email,
                isValid: req.jwtInfo.isValid,
                isOauth: req.jwtInfo.isOauth,
                accessToken: req.jwtInfo.accessToken,
                twofaVerified: true
            });

            res = authService.setJwtOnCookie(res, jwtToken);

            res.send();
        }
    } catch (error) {
        next(error);
    }
});

//https://typo.tistory.com/entry/Nodejs-JQuery-%ED%9A%8C%EC%9B%90%EA%B0%80%EC%9E%85-%EB%A7%8C%EB%93%A4%EA%B8%B0-%EC%9D%B8%EC%A6%9D%EB%B2%88%ED%98%B8-%EC%9D%B4%EB%A9%94%EC%9D%BC-%EC%A0%84%EC%86%A12

/* POST /auth/register/email/send
*/
//TODO : verifyValid 추가
router.post('/register/email/send', function (req, res, next) {
    try {
        const email = req.body.email;
        //const email = req.jwtInfo.email;
        if (!email) {
            return res.status(400).send('Email not found.');
        }
        authService.createRegistURL(email);
        res.send();
    } catch (error) {
        next(error);
    }
});

/* GET /auth/register/email/verify
code : String 인증 코드
*/

//TODO : verifyValid 추가
router.get('/register/email/verify', function (req, res, next) {
    try {
        const code = req.query.code;
        const { sessionCode, expirationDate } = req.session.registrationCode;

        if (!code) {
            delete req.session.registrationCode;
            return res.status(400).send('Code not found.');
        } else if (!sessionCode || expirationDate) {
            delete req.session.registrationCode;
            return res.status(401).send('Bad Access.');
        } else if (expirationDate < new Date()) {
            delete req.session.registrationCode;
            return res.status(400).send('Code expired.');
        } else if (sessionCode !== code) { // 위치 다시 생각해보기
            delete req.session.registrationCode;
            return res.status(400).send('Invalid code.');
        }

        jwtToken = authService.generateJWT({
            id: req.jwtInfo.id,
            email: req.jwtInfo.email,
            isValid: true,
            isOauth: req.jwtInfo.isOauth,
            accessToken: req.jwtInfo.accessToken,
            twofaVerified: false
        });

        res = authService.setJwtOnCookie(res, jwtToken);

        res.send();
    } catch (error) {
        next(error);
    }
});



//https://well-made-codestory.tistory.com/37

/* POST /auth/reset/email/create
email : String 사용자 이메일
*/

router.post('/reset/email/create', async function (req, res, next) {
    try {
        const email = req.body.email;
        if (!email) {
            res.status(400).send('이메일이 없습니다.');
        }
        await authService.createResetPasswordURL(req, email);
        res.send();
    } catch (error) {
        next(error);
    }
});


//세션으로 인증된 유저라는 것을 확인
/* GET /auth/reset/email/verify
code : String 인증 코드
*/
router.get('/reset/email/verify', function (req, res, next) {
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
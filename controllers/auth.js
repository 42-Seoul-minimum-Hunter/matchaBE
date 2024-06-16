var express = require('express');
var router = express.Router();

var authService = require('../services/auth.service.js');

/* POST /auth/login
username : String 사용자 닉네임
password : String 사용자 비밀번호
*/

router.post('/login', function (req, res, next) {
    this.logger.info('POST /auth/login');
    try {
        if (req.body.username === undefined || req.body.password === undefined) {
            throw new Error('username 또는 password가 없습니다.');
        }
        var username = req.body.username;
        var password = req.body.password;
        var user = authService.login(username, password);
        // 유저 정보 다 때려 박음

        if (user === undefined) {
            res.status(400).send('로그인에 실패했습니다.');
        } else {
            res.send(user);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
});

/* POST /auth/logout
*/

router.post('/logout', function (req, res, next) {
    this.logger.info('POST /auth/logout');
    try {
        authService.logout();
        res.send('로그아웃 되었습니다.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

/* POST /auth/callback
code : String OAuth 인증 코드
*/

router.post('/callback', function (req, res, next) {
    this.logger.info('POST /auth/callback');
    try {
        if (req.body.code === undefined) {
            throw new Error('code가 없습니다.');
        }
        var code = req.body.code;
        var user = authService.callback(code);

        if (user === undefined) {
            res.session.code = code;
            res.redirect('/user/register');
        } else {
            res.body.user = user;
            res.send(user);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
});

/* POST /auth/twoFactor/create
username : String 사용자 닉네임
*/

router.post('/twofactor/create', function (req, res, next) {
    this.logger.info('POST /auth/twofactor/create');
    try {
        if (req.body.username === undefined) {
            throw new Error('username가 없습니다.');
        }
        var username = req.body.username;
        var code = authService.twofactorCodeCreate(username);

        if (code === undefined || code === null) {
            res.status(400).send('인증번호가 틀렸습니다.');
        } else {
            res.send(code);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})

/* POST /auth/twoFactor/verify
username : String 사용자 닉네임
code : String 2FA 인증 코드
*/

router.post('/twofactor/verify', function (req, res, next) {
    this.logger.info('POST /auth/twofactor/verify');
    try {
        if (req.body.username === undefined || req.body.code === undefined) {
            throw new Error('username 또는 code가 없습니다.');
        }
        var username = req.body.username;
        var code = req.body.code;
        var result = authService.twofactorCodeVerify(username, code);

        if (result === false) {
            res.status(400).send('인증번호가 틀렸습니다.');
        } else {
            res.send(result);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
});

//https://typo.tistory.com/entry/Nodejs-JQuery-%ED%9A%8C%EC%9B%90%EA%B0%80%EC%9E%85-%EB%A7%8C%EB%93%A4%EA%B8%B0-%EC%9D%B8%EC%A6%9D%EB%B2%88%ED%98%B8-%EC%9D%B4%EB%A9%94%EC%9D%BC-%EC%A0%84%EC%86%A12

/* POST /auth/register/email/send
id : String 사용자 이메일
*/


router.post('/register/email/send', function (req, res, next) {
    this.logger.info('POST /auth/register/email/send');
    try {
        var id = req.body.email;
        if (id === undefined) {
            throw new Error('id가 없습니다.');
        }
        authService.sendForRegistration(id);
        res.send('이메일이 전송되었습니다.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

/* POST /auth/register/email/verify
id : String 사용자 이메일
code : String 인증 코드
*/

router.post('/register/email/verify', function (req, res, next) {
    this.logger.info('POST /auth/register/email/verify');
    try {
        var id = req.body.email;
        var code = req.body.code;
        if (id === undefined || code === undefined) {
            throw new Error('id 또는 code가 없습니다.');
        }
        authService.verifyForRegistration(id, code);
        res.send('인증되었습니다.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});



//https://well-made-codestory.tistory.com/37

/* POST /auth/reset/email/create
username : String 사용자 닉네임
*/

router.post('/reset/email/create', function (req, res, next) {
    this.logger.info('POST /auth/reset/email/create');
    try {
        var username = req.body.username;
        if (username === undefined) {
            throw new Error('username이 없습니다.');
        }
        var user = authService.resetPassword(id);
        res.send(user);
    } catch (error) {
        res.status(404).send('사용자를 찾을 수 없습니다.');
    }
});


//세션으로 인증된 유저라는 것을 확인
/* POST /auth/reset/email/verify
username : String 사용자 닉네임
code : String 인증 코드
*/
router.post('/reset/email/verify', function (req, res, next) {
    this.logger.info('POST /auth/reset/email/verify');
    try {
        var username = req.body.username;
        if (username === undefined) {
            throw new Error('username이 없습니다.');
        }
        var user = authService.changePassword(id);
        res.send(user);
    } catch (error) {
        res.status(404).send('사용자를 찾을 수 없습니다.');
    }
});

module.exports = router;
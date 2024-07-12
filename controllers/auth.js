const express = require("express");
const router = express.Router();
const {
  verifyTwoFA,
  verifyValid,
  verifyResetPassword,
} = require("../configs/middleware.js");
const authService = require("../services/auth.service.js");

const {
  validateUsername,
  validatePassword,
} = require("../configs/validate.js");

const logger = require("../configs/logger.js");

require("dotenv").config();

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

        return 200 -> search redirect

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
    isValid: false,
    isOauth: true,
    accessToken: <accessToken>,
    twofaVerified: false

    return email

2. 회원가입 후 JWT 발급, 쿠키에 담기
    id: user.id,
    email: user.email,
    isValid: false,
    isOauth: true,
    accessToken: <accessToken>,
    twofaVerified: false

    return user

3. 이메일 인증 후 (세션으로 확인)
        id: user.id,
        email: user.email,
        isValid: true,
        isOauth: true,
        accessToken: <accessToken>,
        twofaVerified: false

        return 200

4. 2FA 인증 후 (세션으로 확인)
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

//최초 회원가입 -> 이메일인증 -> search
//로그인 -> 2fa  -> search

// 최초 인데 그냥 회원가입(jwt 없음)
// oauth(/auth/callback 확인해서 처음 온 유저다) jwt oauth 관련한 정보를 쿠키로 담아서
// 회원가입 페이지로 리다이렉트

//회원가입 미들웨어 signup
// jwt X -> 일반유저
// jwt O && isOauth == true && acessToken != null -> oauth 유저

// 회원가입(jwt cookie 재갱신) -> email 인증 -> search

// 일반로그인 -> 2fa -> search
// oauth 로그인(이미 가입한 유저다 ) -> 2fa -> search

router.post("/login", async function (req, res, next) {
  try {
    logger.info("auth.js POST /auth/login: " + JSON.stringify(req.body))
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send("username or password not found.");
    } else if (!validateUsername(username)) {
      return res.status(400).send("username is invalid.");
    } else if (!validatePassword(password)) {
      return res.status(400).send("password is invalid.");
    }

    const user = await authService.loginByUsernameAndPassword(
      username,
      password
    );

    if (!user) {
      return res.status(400).send("User not found.");
    }

    const jwtToken = authService.generateJWT({
      id: user.id,
      email: user.email,
      isValid: user.isValid,
      isOauth: false,
      accessToken: null,
      twofaVerified: false,
    });

    res.cookie("jwt", jwtToken, {});

    res.set("Authorization", `Bearer ${jwtToken}`);

    //if (user.isValid === true) {
    //  return res.redirect(process.env.FE_TWOFACTOR_URL);
    //} else {
    //  //return res.redirect(process.env.FE_EMAIL_VERIFY_URL);
    //  //return res.redirect("");
    //  return res.send();
    //}

    return res.send(user.isValid);
  } catch (error) {
    next(error);
  }
});

/* DELETE/auth/logout
 */
//TODO: POST로 바꾸는거 고려
router.delete("/logout", function (req, res, next) {
  try {
    logger.info("auth.js DELETE /auth/logout")
    res.clearCookie("jwt");
    res.send("로그아웃 되었습니다.");
  } catch (error) {
    next(error);
  }
});

/* GET /auth/callback
code : String OAuth 인증 코드
*/

router.get("/callback", async function (req, res, next) {
  try {
    logger.info("auth.js GET /auth/callback: " + JSON.stringify(req.query.code))
    const code = req.query.code;
    if (!code) {
      return res.status(401).send("Code not found.");
    }

    const result = await authService.getOauthInfo(code);

    const { user, oauthInfo } = result;

    if (!oauthInfo) {
      return res.status(401).send("oauthInfo not found.");
    }

    let jwtToken = null;
    if (!user) {
      jwtToken = authService.generateJWT({
        id: null,
        email: oauthInfo.email,
        isValid: false,
        isValid: false,
        isOauth: true,
        accessToken: oauthInfo.accessToken,
        twofaVerified: false,
      });

      res.cookie("jwt", jwtToken, {
        //httpOnly: true,
        //secure: false,
      });

      res.set("Authorization", `Bearer ${jwtToken}`);
      return res.redirect(process.env.OAUTH_USER_REGISTRATION_URL);
    } else {
      jwtToken = authService.generateJWT({
        id: user.id,
        email: user.email,
        isValid: user.isValid,
        isOauth: true,
        accessToken: oauthInfo.accessToken,
        twofaVerified: false,
      });

      res.cookie("jwt", jwtToken, {
        //httpOnly: true,
        //secure: false,
      });

      res.set("Authorization", `Bearer ${jwtToken}`);
      if (user.isValid === true) {
      return res.redirect(process.env.FE_TWOFACTOR_URL);
      } else {
        return res.redirect('http://localhost:5173/email');
      }
    }
  } catch (error) {
    next(error);
  }
});

/* POST /auth/twoFactor/create
 */
router.post("/twofactor/create", verifyTwoFA, async function (req, res, next) {
  try {
    logger.info("auth.js POST /auth/twofactor/create")
    const email = req.jwtInfo.email;
    //const email = req.body.email;
    if (!email) {
      res.status(400).send("Email not found.");
    }
    await authService.createTwofactorCode(email);
    res.send();
  } catch (error) {
    next(error);
  }
});

/* POST /auth/twoFactor/verify
code : String 2FA 인증 코드
*/
router.post("/twofactor/verify", verifyTwoFA, function (req, res, next) {
  try {
    logger.info("auth.js POST /auth/twofactor/verify: " + JSON.stringify(req.body))
    const email = req.jwtInfo.email;
    const code = req.body.code;

    if (!code) {
      return res.status(400).send("Code not found.");
    } else if (!email) {
      return res.status(400).send("Email not found.");
    }

    const result = authService.verifyTwoFactorCode(code);

    if (result === false) {
      return res.status(400).send("Invalid code.");
    } else {
      const jwtToken = authService.generateJWT({
        id: req.jwtInfo.id,
        email: req.jwtInfo.email,
        isValid: req.jwtInfo.isValid,
        isOauth: req.jwtInfo.isOauth,
        accessToken: req.jwtInfo.accessToken,
        twofaVerified: true,
      });

      res.cookie("jwt", jwtToken, {
        //httpOnly: true,
        //secure: false,
      });

      res.set("Authorization", `Bearer ${jwtToken}`);

      return res.send();
    }
  } catch (error) {
    next(error);
  }
});

//https://typo.tistory.com/entry/Nodejs-JQuery-%ED%9A%8C%EC%9B%90%EA%B0%80%EC%9E%85-%EB%A7%8C%EB%93%A4%EA%B8%B0-%EC%9D%B8%EC%A6%9D%EB%B2%88%ED%98%B8-%EC%9D%B4%EB%A9%94%EC%9D%BC-%EC%A0%84%EC%86%A12

/* POST /auth/register/email/send
 */

router.post(
  "/register/email/send",
  verifyValid,
  async function (req, res, next) {
    try {
      logger.info("auth.js POST /auth/register/email/send")
      //const email = req.body.email;
      const email = req.jwtInfo.email;
      if (!email) {
        return res.status(400).send("Email not found.");
      }
      await authService.createRegistURL(email);
      return res.send();
    } catch (error) {
      next(error);
    }
  }
);

/* GET /auth/register/email/verify
code : String 인증 코드
*/

router.get("/register/email/verify", async function (req, res, next) {
  try {
    logger.info("auth.js GET /auth/register/email/verify: " + JSON.stringify(req.query.code))
    const code = req.query.code;

    if (!code) {
      return res.status(400).send("Code not found.");
    }

    const result = await authService.verifyRegistURL(code);

    if (!result) {
      return res.status(400).send("Invalid code OR Code expired.");
    }

    let jwtInfo = {
      id: result.id,
      email: result.email,
      isValid: true,
      isOauth: result.is_oauth,
      accessToken: null,
      twofaVerified: true,
    };

    if (result.is_oauth === true) {
      const { oauthInfo } = await authService.getOauthInfo(result.email);
      jwtInfo.accessToken = oauthInfo.accessToken;
    }

    const jwtToken = authService.generateJWT(jwtInfo);

    res.cookie("jwt", jwtToken, {
      //httpOnly: true,
      //secure: false,
    });

    return res.redirect(process.env.FE_SEARCH_URL);
  } catch (error) {
    next(error);
  }
});

//https://well-made-codestory.tistory.com/37

/* POST /auth/reset/email/create
email : String 사용자 이메일
*/

router.post("/reset/email/create", async function (req, res, next) {
  try {
    logger.info("auth.js POST /auth/reset/email/create: " + JSON.stringify(req.body))
    const email = req.body.email;
    if (!email) {
      res.status(400).send("Email not found.");
    }
    const resetPasswordJwt = await authService.createResetPasswordURL(email);

    res.cookie("jwt", resetPasswordJwt, {
      //httpOnly: true,
      //secure: false,
    });

    res.set("Authorization", `Bearer ${resetPasswordJwt}`);

    return res.send();
  } catch (error) {
    next(error);
  }
});

//세션으로 인증된 유저라는 것을 확인
/* GET /auth/reset/email/verify
code : String 인증 코드
*/
router.get(
  "/reset/email/verify",
  verifyResetPassword,
  async function (req, res, next) {
    try {

      logger.info("auth.js GET /auth/reset/email/verify: " + JSON.stringify(req.query.code))
      const email = req.jwtInfo.email;
      if (!code || !email) {
        res.status(400).send("Code not found.");
      }
      const result = authService.verifyResetPasswordURL(code);

      if (!result) {
        return res.status(400).send("Invalid code OR Code expired.");
      }

      const jwtToken = authService.generateJWT({
        email: email,
        expirationDate: new Date(Date.now() + 30 * 60 * 1000), //30분 뒤에 만료
        isPasswordResetVerified: true,
      });

      res.cookie("jwt", jwtToken, {
      });

      res.set("Authorization", `Bearer ${jwtToken}`);

      return res.send("redirect");

      //res.redirect(FE_RESET_PASSWORD_URL);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

//LOGIN
//ISVALID 유무에 따라 달라짐 왜 달라지냐! 그냥 회원가하하고 나가는 경우가 다다고 판단함

//LOGIN -> ISVALID == TRUE -> 이 사람은 이일일 인증 한사람이니까 2FA로 가라
//LOGIN -> ISVALID == FALSE -> 이 쥐새끼 같은놈 하고 이메일 인증 페이지로 가라

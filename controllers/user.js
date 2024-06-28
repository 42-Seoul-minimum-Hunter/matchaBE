const express = require("express");
const router = express.Router();
const morgan = require("morgan");

const { UserGender } = require("../enums/user.gender.enum.js");
const { UserPreference } = require("../enums/user.preference.enum.js");
const { UserHashtag } = require("../enums/user.hashtag.enum.js");

const {
  validateEmail,
  validateUsername,
  validatePassword,
  validateName,
  validateBiography,
  validateAge,
  validateGender,
  validatePreference,
  validateHashtags,
  validateSi,
  validateGu,
} = require("../configs/validate.js");

const {
  checkOauthLogin,
  verifyAllprocess,
  verifyChangePassword,
} = require("../configs/middleware.js");

const userSerivce = require("../services/user.service.js");
const authService = require("../services/auth.service.js");

morgan("combined", {
  skip: function (request, response) {
    return response.statusCode < 400;
  },
});

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
isGpsAllowed : Boolean GPS 사용 허용 여부
hashtags : Object 사용자 해시태그
si : String 사용자 시
gu : String 사용자 구
profileImages : String 사용자 프로필 이미지 => BASE64로 반환 예정
}
*/

//TODO: jwt 토큰 확인 추가
//TODO: username, password 정규표현식, email 형식 확인, biography 정규표현식

//TODO: 이미지 형식 확인
//TODO: 해시태그 형식 확인

//gender, preference, hashtags enum

//TODO: 2차원으로 profileImage 저장하는 거 해결
router.post("/create", checkOauthLogin, async function (req, res, next) {
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
      isGpsAllowed: req.body.isGpsAllowed,
      hashtags: req.body.hashtags || undefined,
      si: req.body.si || undefined,
      gu: req.body.gu || undefined,
      profileImages: req.body.profileImages || undefined,
    };

    console.log(user);

    const requiredFields = [
      "email",
      "username",
      "password",
      "lastName",
      "firstName",
      "gender",
      "preference",
      "biography",
      "age",
      "isGpsAllowed",
      "hashtags",
      "si",
      "gu",
      "profileImages",
    ];

    for (const field of requiredFields) {
      if (user[field] === undefined) {
        return res.status(400).send(`Please enter the ${field} field.`);
      }
    }

    if (!validateEmail(user.email)) {
      return res.status(400).send("Please enter a valid email.");
    } else if (!validateUsername(user.username)) {
      console.log("hashtags");
      return res
        .status(400)
        .send("Please enter a valid username. (4~15 characters)");
    } else if (!validatePassword(user.password)) {
      return res
        .status(400)
        .send("Please enter a valid password. (8~15 characters)");
    } else if (!validateName(user.lastName) || !validateName(user.firstName)) {
      return res
        .status(400)
        .send("Please enter a valid name. (4~10 characters)");
    } else if (!validateBiography(user.biography)) {
      return res
        .status(400)
        .send("Please enter a valid biography. (1~100 characters)");
    } else if (!validateAge(user.age)) {
      return res.status(400).send("Please enter a valid age. (1~100)");
    } else if (!validateGender(user.gender)) {
      return res.status(400).send("Please enter a valid gender.");
    } else if (!validatePreference(user.preference)) {
      return res.status(400).send("Please enter a valid preference.");
    } else if (!validateHashtags(user.hashtags)) {
      return res.status(400).send("Please enter a valid hashtags.");
    } else if (!validateSi(user.si)) {
      return res.status(400).send("Please enter a valid si.");
    } else if (!validateGu(user.si, user.gu)) {
      return res.status(400).send("Please enter a valid gu.");
    }

    if (req.jwtInfo && req.jwtInfo.isOauth && req.jwtInfo.accessToken) {
      user.isOauth = true;
    } else {
      user.isOauth = false;
    }

    const user_id = await userSerivce.createUser(user);
    if (!user_id) {
      console.log("Bad Request");
      return res.status(400).send("Bad Request");
    }
    user.id = user_id;

    let jwtToken;
    if (req.jwtInfo && req.jwtInfo.isOauth && req.jwtInfo.accessToken) {
      jwtToken = authService.generateJWT({
        id: user.id,
        email: user.email,
        isValid: false,
        isOauth: user.isOauth,
        accessToken: req.jwtInfo.accessToken,
        twofaVerified: false,
      });
    } else {
      jwtToken = authService.generateJWT({
        id: user.id,
        email: user.email,
        isValid: false,
        isOauth: user.isOauth,
        accessToken: null,
        twofaVerified: false,
      });
    }

    console.log(jwtToken);
    //res.cookie("jwt", jwtToken, {
    //  sameSite: "none",
    //  secure: true,
    //  httpOnly: true,
    //});

    res.cookie("jwt", jwtToken, {
      //sameSite: "none", // 크로스 사이트 요청 위험을 방지하기 위해 설정
    });

    console.log(res.cookie);

    res.set("Authorization", `Bearer ${jwtToken}`);
    return res.send(user);
  } catch (error) {
    next(error);
  }
});

/* DELETE /user/unregister
 */

//TODO: jwt 토큰 확인 추가
router.delete("/unregister", verifyAllprocess, async function (req, res, next) {
  try {
    await userSerivce.unregister(req.jwtInfo.id);
    res.clearCookie("jwt");
    return res.send();
  } catch (error) {
    next(error);
  }
});

//세션으로 변경 가능 여부 확인
/* POST /user/change/password
password : String 사용자 비밀번호
*/
router.post(
  "/change/password",
  verifyChangePassword,
  async function (req, res, next) {
    try {
      let password = req.body.password;
      const { email, expirationDate } = req.jwtInfo.email;

      if (!password || !validatePassword(password)) {
        return res.status(400).send("Please enter the password field.");
      } else if (!email) {
        return res.status(400).send("Please enter the email field.");
      } else if (expirationDate < new Date()) {
        return res.status(400).send("The link has expired. Please try again.");
      }

      await userSerivce.changePassword(password, email);
      res.clearCookie("jwt");
      return res.send();
    } catch (error) {
      next(error);
    }
  }
);

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
router.get("/find", verifyChangePassword, async function (req, res, next) {
  try {
    let {
      username,
      hashtags,
      minAge,
      maxAge,
      minRate,
      maxRate,
      si,
      gu,
      page = 1,
      pageSize = 20,
    } = req.query;

    const filter = {
      username: username || undefined,
      hashtags: hashtags || undefined,
      minAge: minAge ? Number(minAge) : undefined,
      maxAge: maxAge ? Number(maxAge) : undefined,
      minRate: minRate ? Number(minRate) : undefined,
      maxRate: maxRate ? Number(maxRate) : undefined,
      si: si || undefined,
      gu: gu || undefined,
    };
    if (minAge && maxAge && minAge > maxAge) {
      return res.status(400).send("최소 나이가 최대 나이보다 큽니다.");
    } else if (minAge && minAge < 0) {
      return res.status(400).send("최소 나이가 0보다 작습니다.");
    } else if (minRate && maxRate && minRate > maxRate) {
      return res.status(400).send("최소 평점이 최대 평점보다 큽니다.");
    } else if (si === undefined && gu !== undefined) {
      return res.status(400).send("시를 입력해주세요.");
    }

    const { users, totalCount } = await userSerivce.findUserByFilter(
      req.jwtInfo.id,
      filter,
      page,
      pageSize
    );
    return res.send({ users, totalCount, currentPage: page });
  } catch (error) {
    next(error);
  }
});

/* GET /user/search/region
 */
//TODO: jwt 토큰 확인 추가
//TODO: isGpsAllowed 확인 상관없이 위치 확인
router.get("/search/region", function (req, res, next) {
  try {
    let region = userSerivce.getRegion(req.jwtInfo.id);
    return res.send(region);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

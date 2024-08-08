const express = require("express");
const router = express.Router();
const logger = require("../configs/logger.js");

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
  verifyCreateUserSession,
  verifyAllprocess,
  verifyChangePassword,
} = require("../configs/middleware.js");

const userSerivce = require("../services/user.service.js");
const authService = require("../services/auth.service.js");

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

router.post(
  "/create",
  verifyCreateUserSession,
  async function (req, res, next) {
    try {
      logger.info("user.js POST /user/create: " + JSON.stringify(req.body));

      const userInfo = {
        username: req.body.username || undefined,
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

      const requiredFields = [
        "username",
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
        if (userInfo[field] === undefined) {
          return res.status(400).send(`Please enter the ${field} field.`);
        }
      }

      if (!validateUsername(userInfo.username)) {
        return res
          .status(400)
          .send("Please enter a valid username. (4~15 characters)");
      } else if (
        !validateName(userInfo.lastName) ||
        !validateName(userInfo.firstName)
      ) {
        return res
          .status(400)
          .send("Please enter a valid name. (4~10 characters)");
      } else if (!validateBiography(userInfo.biography)) {
        return res
          .status(400)
          .send("Please enter a valid biography. (1~100 characters)");
      } else if (!validateAge(userInfo.age)) {
        return res.status(400).send("Please enter a valid age. (1~100)");
      } else if (!validateGender(userInfo.gender)) {
        return res.status(400).send("Please enter a valid gender.");
      } else if (!validatePreference(userInfo.preference)) {
        return res.status(400).send("Please enter a valid preference.");
      } else if (!validateHashtags(userInfo.hashtags)) {
        return res.status(400).send("Please enter a valid hashtags.");
      } else if (!validateSi(userInfo.si)) {
        return res.status(400).send("Please enter a valid si.");
      } else if (!validateGu(userInfo.si, userInfo.gu)) {
        return res.status(400).send("Please enter a valid gu.");
      }

      const { email, password, isOauth, accessToken } = req.userInfo;

      userInfo.isOauth = isOauth;

      const user_id = await userSerivce.createUser(userInfo, email, password);
      if (!user_id) {
        return res.status(400).send("Bad Request");
      }
      userInfo.id = user_id;

      const jwtToken = authService.generateJWT({
        id: userInfo.id,
        email: email,
        isOauth: isOauth,
        accessToken: accessToken,
        twofaVerified: true,
      });

      res.cookie("jwt", jwtToken, {});

      res.set("Authorization", `Bearer ${jwtToken}`);
      return res.send();
    } catch (error) {
      next(error);
    }
  }
);

/* DELETE /user/unregister
 */

router.delete("/unregister", verifyAllprocess, async function (req, res, next) {
  try {
    logger.info("user.js DELETE /user/unregister");
    await userSerivce.unregister(req.jwtInfo.id);

    res.clearCookie("jwt");
    return res.send();
  } catch (error) {
    next(error);
  }
});

/* POST /user/change/password
password : String 사용자 비밀번호
confirmedPassword : String 사용자 비밀번호 확인
*/
//TOOD: 세션확인 추가
router.post("/change/password", async function (req, res, next) {
  try {
    logger.info(
      "user.js POST /user/change/password: " + JSON.stringify(req.body)
    );
    let password = req.body.password;
    const confirmedPassword = req.body.confirmedPassword;

    const { email, expirationDate } = req.session.resetPasswordEmail;

    if (!email) {
      return res.status(400).send("Bad Request");
    } else if (!password || !validatePassword(password)) {
      return res.status(400).send("Please enter the password field.");
    } else if (!confirmedPassword) {
      return res.status(400).send("Please enter the confirmedPassword field.");
    } else if (!validateEmail(email)) {
      return res.status(400).send("Please enter a valid email.");
    } else if (expirationDate < new Date()) {
      return res.status(400).send("The link has expired. Please try again.");
    } else if (password !== confirmedPassword) {
      return res.status(400).send("Passwords do not match.");
    }

    await userSerivce.changePassword(password, email);

    req.session.destroy();
    return res.send();
  } catch (error) {
    next(error);
  }
});

/* GET /user/find
hashtags : String 사용자 해시태그
minAge : Number 사용자 최소 나이
maxAge : Number 사용자 최대 나이
minRate : Number 사용자 평점
maxRate : Number 사용자 평점
si : String 사용자 시
gu : String 사용자 구
*/
router.get("/find", verifyAllprocess, async function (req, res, next) {
  try {
    logger.info("user.js GET /user/find: " + JSON.stringify(req.query));
    let {
      hashtags,
      minAge,
      maxAge,
      minRate,
      maxRate,
      si,
      gu,
      page = 1,
      pageSize = 15,
    } = req.query;

    //console.log(hashtags);

    if (hashtags === "[]") {
      hashtags = undefined;
    } else if (hashtags) {
      hashtags = hashtags.replace(/[\[\]']/g, "").split(",");
    }

    const filter = {
      hashtags: hashtags,
      minAge: minAge ? Number(minAge) : undefined,
      maxAge: maxAge ? Number(maxAge) : undefined,
      minRate: minRate ? Number(minRate) : undefined,
      maxRate: maxRate ? Number(maxRate) : undefined,
      si: si || undefined,
      gu: gu || undefined,
    };

    if (minAge && maxAge && Number(minAge) > Number(maxAge)) {
      return res.status(400).send("최소 나이가 최대 나이보다 큽니다.");
    } else if (minAge && Number(minAge) < 0) {
      return res.status(400).send("최소 나이가 0보다 작습니다.");
    } else if (minRate && maxRate && Number(minRate) > Number(maxRate)) {
      return res.status(400).send("최소 평점이 최대 평점보다 큽니다.");
    } else if (si === undefined && gu !== undefined) {
      return res.status(400).send("시를 입력해주세요.");
    } else if (page && page < 1) {
      return res.status(400).send("페이지는 1 이상이어야 합니다.");
    } else if (pageSize && pageSize < 1) {
      return res.status(400).send("페이지 크기는 1 이상이어야 합니다.");
    } else if (hashtags && !validateHashtags(hashtags)) {
      return res.status(400).send("해시태그가 올바르지 않습니다.");
    } else if (minRate && !Number.isInteger(minRate) && minRate < 0) {
      return res.status(400).send("평점은 정수로 입력해주세요.");
    } else if (maxRate && !Number.isInteger(maxRate) && maxRate < 0) {
      return res.status(400).send("평점은 정수로 입력해주세요.");
    }

    const { users, totalCount } = await userSerivce.findUserByFilter(
      req.jwtInfo.id,
      filter,
      page,
      pageSize
    );

    return res.send({ users, totalCount, currentPage: Number(page) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

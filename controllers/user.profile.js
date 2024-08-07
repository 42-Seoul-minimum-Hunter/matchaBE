const express = require("express");
const router = express.Router();
const { verifyAllprocess } = require("../configs/middleware.js");

const {
  validateEmail,
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
const userProfileService = require("../services/user.profile.service.js");

const logger = require("../configs/logger.js");

/* GET /user/profile?username=john
username : String 사용자 닉네임
*/

//TODO: 조회 기록 저장 추가
//TODO: 온라인 상태 확인 추가
//TODO: 해당 유저 LIKE 정보
//TODO: 매치 유무 확인
router.get("/", async function (req, res, next) {
  try {
    logger.info(
      "user.profile.js GET /user/profile: " + JSON.stringify(req.query)
    );
    const { username } = req.query;
    if (!username) {
      return res.status(400).send("username is required.");
    }
    const user = await userProfileService.getUserProfile(
      username,
      req.jwtInfo.id
    );
    return res.send(user);
  } catch (error) {
    next(error);
  }
});

/* GET /user/profile/me/
 */
router.get("/me", async function (req, res, next) {
  try {
    logger.info("user.profile.js GET /user/profile/me");
    const user = await userProfileService.getMyInfo(req.jwtInfo.id);
    return res.send(user);
  } catch (error) {
    next(error);
  }
});

/* GET /user/profile/settings
 */
router.get("/settings", async function (req, res, next) {
  try {
    logger.info("user.profile.js GET /user/profile/settings");
    const user = await userProfileService.getSettings(req.jwtInfo.id);
    return res.send(user);
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
isGpsAllowed : Boolean GPS 사용 허용 여부 => Date로 반환 예정
hastags : Object 사용자 해시태그
region : Object 사용자 위치
profileImages : String 사용자 프로필 이미지 => BASE64로 반환 예정
}
*/

router.put("/update", verifyAllprocess, async function (req, res, next) {
  try {
    logger.info(
      "user.profile.js PUT /user/profile/update: " + JSON.stringify(req.body)
    );
    const user = {
      email: req.body.email || undefined,
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
      isTwofa: req.body.isTwofa || undefined,
    };

    const requiredFields = [
      "email",
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

    if (hashtags === "[]") {
      hashtags = undefined;
    } else if (hashtags) {
      hashtags = hashtags.replace(/[\[\]']/g, "").split(",");
    }

    if (!validateEmail(user.email)) {
      return res.status(400).send("Please enter a valid email.");
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

    await userProfileService.updateUser(user, req.jwtInfo.id);

    if (user.email !== req.jwtInfo.email) {
      const jwtToken = authService.generateJWT({
        id: req.jwtInfo.id,
        email: user.email,
        isValid: req.jwtInfo.isValid,
        isOauth: req.jwtInfo.isOauth,
        accessToken: req.jwtInfo.accessToken,
        twofaVerified: req.jwtInfo.twofaVerified,
      });

      res.cookie("jwt", jwtToken, {
        //httpOnly: true,
        //secure: false,
      });

      res.set("Authorization", `Bearer ${jwtToken}`);
    }
    return res.send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;

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
  validateProfileImages,
} = require("../configs/validate.js");
const userProfileService = require("../services/user.profile.service.js");
const authService = require("../services/auth.service.js");

const logger = require("../configs/logger.js");
/* GET /user/profile?username=john
username : String 사용자 닉네임
*/

//TODO: 매치 유무 확인
router.get("/", verifyAllprocess, async function (req, res, next) {
  try {
    logger.info(
      "user.profile.js GET /user/profile: " + JSON.stringify(req.query)
    );
    const userActivate = req.app.get("userActivate");
    console.log(userActivate);
    const { username } = req.query;
    if (!username) {
      return res.status(400).send("username is required.");
    }
    const user = await userProfileService.getUserProfile(
      username,
      req.jwtInfo.id
    );
    if (!user) {
      return res.status(404).send("User not found.");
    } else if (userActivate) {
      user.isOnline = userActivate.get(user.id) ? true : false;
    }
    return res.send(user);
  } catch (error) {
    next(error);
  }
});

/* GET /user/profile/me/
 */
router.get("/me", verifyAllprocess, async function (req, res, next) {
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
router.get("/settings", verifyAllprocess, async function (req, res, next) {
  try {
    logger.info("user.profile.js GET /user/profile/settings");
    const user = await userProfileService.getSettingsInfo(req.jwtInfo.id);
    return res.send(user);
  } catch (error) {
    next(error);
  }
});

/* POST /user/profile/update
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

router.post("/update", verifyAllprocess, async function (req, res, next) {
  try {
    logger.info(
      "user.profile.js POST /user/profile/update: " + JSON.stringify(req.body)
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
      isTwofa: req.body.isTwofa,
    };

    const profileImages = req.body.profileImages || undefined;

    if (!profileImages) {
      return res.status(400).send("Please enter the profileImages field.");
    }

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
      "isTwofa",
    ];

    for (const field of requiredFields) {
      if (user[field] === undefined) {
        return res.status(400).send(`Please enter the ${field} field.`);
      }
    }

    userInfo.profileImages = profileImages.map((file) => {
      // Determine the MIME type of the image (e.g., image/png, image/jpeg)
      const mimeType = file.mimetype;

      // Validate MIME type
      if (!mimeType.startsWith("image/")) {
        return res.status(400).send("Please enter a valid image file.");
      }

      // Convert the image buffer to a Base64 string
      const base64String = file.buffer.toString("base64");

      // Create the data URL format
      return `data:${mimeType};base64,${base64String}`;
    });

    // hashtags 처리
    if (Array.isArray(user.hashtags)) {
      user.hashtags = user.hashtags
        .map((tag) => tag.trim())
        .filter((tag) => tag); // 각 태그의 공백 제거 및 빈 태그 필터링
    } else if (typeof user.hashtags === "string") {
      user.hashtags = user.hashtags
        .replace(/[\[\]']/g, "")
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);
    } else {
      user.hashtags = undefined; // 다른 타입일 경우 undefined로 설정
    }

    // profileImages 처리
    //if (Array.isArray(user.profileImages)) {
    //  user.profileImages = user.profileImages
    //    .map((image) => image.trim())
    //    .filter((image) => image); // 각 이미지의 공백 제거 및 빈 이미지 필터링
    //} else if (typeof user.profileImages === "string") {
    //  user.profileImages = user.profileImages
    //    .split(",")
    //    .map((image) => image.trim())
    //    .filter((image) => image);
    //} else {
    //  user.profileImages = undefined; // 다른 타입일 경우 undefined로 설정
    //}

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
    } else if (typeof user.isTwofa === undefined) {
      return res.status(400).send("Please enter a valid twofa.");
    } else if (typeof user.isGpsAllowed === undefined) {
      return res.status(400).send("Please enter a valid gps allowed.");
    } else if (!validateProfileImages(user.profileImages)) {
      return res.status(400).send("Please enter a valid profileImages.");
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

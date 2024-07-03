const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userProfileImageRepository = require("../repositories/user.profileImage.repository.js");
const userRepository = require("../repositories/user.repository");
const sendEmail = require("../configs/sendEmail.js");
const { totp } = require("otplib");
const moment = require("moment-timezone");
const axios = require("axios");
const bcypt = require("bcrypt");
const logger = require("../configs/logger.js");

const registerationCode = new Map();
const twoFactorCode = new Map();
const resetPasswordCode = new Map();

const loginByUsernameAndPassword = async (username, password) => {
  try {
    logger.info("auth.service.js loginByUsernameAndPassword: " + username + ", " + password); 
    const userInfo = await userRepository.findUserByUsername(username);

    if (!userInfo) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    } else if (userInfo.is_oauth === true) {
      const error = new Error(
        "OAuth user cannot login with username and password"
      );
      error.status = 400;
      throw error;
    } else if (await bcypt.compare(password, userInfo.password)) {
      const error = new Error("Password not match");
      error.status = 400;
      throw error;
    }

    return userInfo;
  } catch (error) {
    logger.error("auth.service.js loginByUsernameAndPassword: " + error.message);
    throw error;
  }
};

const getOauthInfo = async (code) => {
  try {
    logger.info("auth.service.js getOauthInfo: " + code)
    const accessToken = await getAccessTokens(code);
    const oauthInfo = await getOAuthInfo(accessToken);
    var user = await userRepository.findUserByEmail(oauthInfo.email);

    if (!user) {
      return { user: null, oauthInfo };
    } else {
      const profileImageInfo =
        await userProfileImageRepository.findProfileImagesById(user.id);
      user.profileImage = profileImageInfo[0][0];
      return { user: user, oauthInfo: oauthInfo };
    }
  } catch (error) {
    logger.error("auth.service.js getOauthInfo: " + error.message);
    throw error;
  }
};

const createTwofactorCode = async (email) => {
  try {
    logger.info("auth.service.js createTwofactorCode: " + email);
    const code = totp.generate(process.env.TWOFACTOR_SECRET);

    // 이메일 내용 구성
    const emailContent = `안녕하세요

        귀하의 2단계 인증 코드는 다음과 같습니다:
        ${code}

        이 코드는 5분 동안 유효합니다.
        감사합니다.`;

    await sendEmail({
      to: email,
      subject: "[MATCHA] 2차 인증 코드",
      text: emailContent,
    });

    const userTimezone = "Asia/Seoul"; // 사용자의 시간대
    const expirationDate = moment().tz(userTimezone).add(5, "minutes").toDate(); // 5분 후 만료

    twoFactorCode.set(code, expirationDate);
    // twoFactorCode[code] = expirationDate;
  } catch (error) {
    logger.error("auth.service.js createTwofactorCode: " + error.message);
    throw error;
  }
};

const verifyTwoFactorCode = (code) => {
  try {
    logger.info("auth.service.js verifyTwoFactorCode: " + code);
    const secret = process.env.TWOFACTOR_SECRET;
    const expirationDate = twoFactorCode.get(code);

    if (!expirationDate) {
      return false;
    } else if (expirationDate < new Date()) {
      twoFactorCode.delete(code);
      return false;
    } else if (totp.verify({ secret, code })) {
      delete req.session.twoFactorCode;
      return true;
    }
  } catch (error) {
    logger.error("auth.service.js verifyTwoFactorCode: " + error.message);
    throw error;
  }
};

const createRegistURL = async (email) => {
  try {
    logger.info("auth.service.js createRegistURL: " + email)
    const code = crypto.randomBytes(20).toString("hex");
    const userTimezone = "Asia/Seoul"; // 사용자의 시간대
    const expirationDate = moment().tz(userTimezone).add(5, "minutes").toDate(); // 5분 후 만료

    // 이메일 내용 구성
    const emailContent = `안녕하세요
  
        귀하의 등록 URL는 다음과 같습니다:
        ${process.env.REGISTER_VERIFY_URL}?code=${code}
    
        이 코드는 5분 동안 유효합니다.
        감사합니다.`;

    await sendEmail({
      to: email,
      subject: "[MATCHA] 회원가입 인증 URL",
      text: emailContent,
    });

    registerationCode.set(code, { expirationDate, email });
  } catch (error) {
    logger.error("auth.service.js createRegistURL: " + error.message);
    throw error;
  }
};

const verifyRegistURL = async (code) => {
  try {
    logger.info("auth.service.js verifyRegistURL: " + code)
    const { expirationDate, email } = registerationCode.get(code);
    if (!expirationDate) {
      return false;
    } else if (expirationDate < new Date()) {
      registerationCode.delete(code);
      return false;
    } else {
      registerationCode.delete(code);
      await userRepository.updateUserValidByEmail(email);
      const userInfo = await userRepository.findUserByEmail(email);
      return userInfo;
    }
  } catch (error) {
    logger.error("auth.service.js verifyRegistURL: " + error.message);
    throw error;
  }
};

const createResetPasswordURL = async (email) => {
  try {
    logger.info("auth.service.js createResetPasswordURL: " + email)
    const userInfo = await userRepository.findUserByEmail(email);

    if (!userInfo) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    const code = crypto.randomBytes(20).toString("hex");
    const userTimezone = "Asia/Seoul"; // 사용자의 시간대
    const expirationDate = moment()
      .tz(userTimezone)
      .add(30, "minutes")
      .toDate(); // 5분 후 만료

    // 이메일 내용 구성
    const emailContent = `안녕하세요

        귀하의 비밀번호 초기화 URL는 다음과 같습니다:
        ${process.env.BE_RESET_PASSWORD_URL}?code=${code}

        이 코드는 30분 동안 유효합니다.
        감사합니다.`;

    await sendEmail({
      to: email,
      subject: "[MATCHA] 비밀번호 초기화 URL",
      text: emailContent,
    });

    const resetPasswordInfo = {
      email,
      isPasswordResetVerified: false,
      isValid: userInfo.isValid,
    };

    // resetPasswordCode[code] = expirationDate;
    resetPasswordCode.set(code, expirationDate);

    return resetPasswordInfo;
  } catch (error) {
    logger.error("auth.service.js createResetPasswordURL: " + error.message);
    throw error;
  }
};

const verifyResetPasswordURL = (code) => {
  try {
    logger.info("auth.service.js verifyResetPasswordURL: " + code)
    const expirationDate = resetPasswordCode.get(code);
    if (!expirationDate) {
      return false;
    } else if (expirationDate < new Date()) {
      resetPasswordCode.delete(code);
      return false;
    } else {
      resetPasswordCode.delete(code);
      return true;
    }
  } catch (error) {
    logger.error("auth.service.js verifyResetPasswordURL: " + error.message);
    throw error;
  }
};

const generateJWT = (obj) => {
  try {
    const jwtToken = jwt.sign(obj, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    return jwtToken;
  } catch (error) {
    logger.error("auth.service.js generateJWT: " + error.message);
    throw error;
  }
};

const getAccessTokens = async (code) => {
  try {
    logger.info("auth.service.js getAccessTokens: " + code)
    const data = {
      grant_type: "authorization_code",
      client_id: process.env.OAUTH_CLIENT_ID,
      client_secret: process.env.OAUTH_CLIENT_SECRET,
      code: code,
      redirect_uri: process.env.OAUTH_CALLBACK_URI,
    };

    const response = await axios.post(process.env.OAUTH_TOKEN_URI, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (response.status !== 200) {
      const error = new Error("Failed to get tokens");
      error.status = response.status;
      throw error;
    }
    return response.data.access_token;
  } catch (error) {
    logger.error("auth.service.js getAccessTokens: " + error.message);
    throw error;
  }
};

const getOAuthInfo = async (accessToken) => {
  try {
    logger.info("auth.service.js getOAuthInfo: " + accessToken);
    const response = await axios.get(process.env.OAUTH_USER_URI, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status !== 200) {
      const error = new Error("Failed to get OAuth info");
      error.status = response.status;
      throw error;
    }

    const oauthInfo = {
      id: null,
      email: response.data.email,
      isValid: null,
      isOauth: true,
      accessToken: accessToken,
      twofaVerified: false,
    };

    return oauthInfo;
  } catch (error) {
    logger.error("auth.service.js getOAuthInfo: " + error.message);
    throw error;
  }
};

module.exports = {
  loginByUsernameAndPassword,
  getOauthInfo,
  generateJWT,

  getAccessTokens,
  getOAuthInfo,

  createTwofactorCode,
  verifyTwoFactorCode,

  createRegistURL,
  verifyRegistURL,

  createResetPasswordURL,
  verifyResetPasswordURL,
};

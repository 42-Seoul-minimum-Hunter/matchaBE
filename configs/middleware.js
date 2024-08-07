const jwt = require("jsonwebtoken");
const logger = require("./logger.js");

function verifyTwoFactor(req, res, next) {
  logger.info("middleware verifyTwoFactor");
  if (!req.headers.authorization) {
    return res.status(401).send("No token provided.");
  }
  // 1. 요청 헤더에서 토큰을 가져옵니다.
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    // 토큰이 없는 경우 401 Unauthorized 응답을 보냅니다.
    return res.status(401).send("No token provided.");
  }

  try {
    // 2. JWT 토큰을 검증합니다.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.twofaVerified === true) {
      return res
        .status(401)
        .send("Two Factor Authentication is already verified.");
    }

    req.jwtInfo = decoded; // 검증된 토큰 정보를 req.user에 저장합니다.
    next(); // 다음 미들웨어로 진행합니다.
  } catch (error) {
    // 토큰 검증에 실패한 경우 401 Unauthorized 응답을 보냅니다.
    logger.error("middleware verifyTwoFactor error");
    return res.status(401).send("Failed to authenticate token.");
  }
}

function verifyAllprocess(req, res, next) {
  logger.info("middleware verifyAllprocess");
  if (!req.headers.authorization) {
    return res.status(401).send("No token provided.");
  }
  // 1. 요청 헤더에서 토큰을 가져옵니다.
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    // 토큰이 없는 경우 401 Unauthorized 응답을 보냅니다.
    return res.status(401).send("No token provided.");
  }

  try {
    // 2. JWT 토큰을 검증합니다.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.twofaVerified === false) {
      return res.status(401).send("Two Factor Authentication is not verified.");
    }

    req.jwtInfo = decoded; // 검증된 토큰 정보를 req.user에 저장합니다.
    next(); // 다음 미들웨어로 진행합니다.
  } catch (error) {
    // 토큰 검증에 실패한 경우 401 Unauthorized 응답을 보냅니다.
    logger.error("middleware verifyAllprocess error");
    return res.status(401).send("Failed to authenticate token.");
  }
}

function checkOauthLogin(req, res, next) {
  try {
    logger.info("middleware checkOauthLogin");
    if (!req.headers.authorization) {
      req.jwtInfo = undefined;
      next();
    }

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.isOauth === false || decoded.accessToken === null) {
      return res.status(400).send("Bad Access");
    }

    req.jwtInfo = decoded;
    next();
  } catch (error) {
    logger.error("middleware checkOauthLogin error");
    return res.status(400).send("Bad Access");
  }
}

function verifyChangePassword(req, res, next) {
  try {
    logger.info("middleware verifyChangePassword");
    if (!req.headers.authorization) {
      return res.status(401).send("No token provided.");
    }
    const token = req.headers.resetPasswordJwt.split(" ")[1];

    if (!token) {
      return res.status(400).send("Bad Access");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.isPasswordVerified === false) {
      return res.status(400).send("Bad Access");
    }

    req.resetPasswordJwt = decoded;
    next();
  } catch (error) {
    logger.error("middleware verifyChangePassword error");
    return res.status(400).send("Bad Access");
  }
}

function verifyCreateUserSession(req, res, next) {
  try {
    logger.info("middleware verifyCreateUserSession");

    if (!req.session.userInfo) {
      return res.status(400).send("Bad Access");
    } else if (req.session.userInfo.isValid === false) {
      return res.status(400).send("InValid User");
    }

    req.userInfo = req.session.userInfo;

    next();
  } catch (error) {
    logger.error("middleware verifyCreateUserSession error");
    return res.status(400).send("Bad Access");
  }
}

function verifyRegistEmailSession(req, res, next) {
  try {
    logger.info("middleware verifyRegistEmailSession");

    if (!req.session) {
      return res.status(400).send("Session Not Found");
    } else if (!req.session.userInfo) {
      return res.status(400).send("Bad Access");
    }

    next();
  } catch (error) {
    logger.error("middleware verifyRegistEmailSession error");
    return res.status(400).send("Bad Access");
  }
}

module.exports = {
  verifyTwoFactor,
  verifyAllprocess,
  verifyCreateUserSession,
  verifyRegistEmailSession,

  checkOauthLogin,
  verifyChangePassword,
};

/*
Header, authorization
{
  'content-type': 'application/json',
  authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6bnVsbCwiZW1haWwiOiJ5ZW9taW5Ac3R1ZGVudC40MnNlb3VsLmtyIiwiaXNWYWxpZCI6ZmFsc2UsImlzT2F1dGgiOnRydWUsImFjY2Vzc1Rva2VuIjoiZTQxNDIwODY4M2JhYzE3ZjQ4N2QyNzY5ODFjODQ4YmRmZTQxYTYwNjhlZjQyY2UxOTI1MWU2NDZjYjU1ODg2NSIsInR3b2ZhVmVyaWZpZWQiOmZhbHNlLCJpYXQiOjE3MTkxNTQ5NTQsImV4cCI6MTcxOTI0MTM1NH0.52-Kq_ACUsYtAVRNb3y_qiSoYlC0XcD0flQ3EKiZtLc',
  'user-agent': 'PostmanRuntime/7.39.0',
}
*/

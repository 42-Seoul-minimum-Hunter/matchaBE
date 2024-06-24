const jwt = require("jsonwebtoken");

function verifyJWTToken(req, res, next) {
  // 1. 요청 헤더에서 토큰을 가져옵니다.
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    // 토큰이 없는 경우 401 Unauthorized 응답을 보냅니다.
    return res.status(401).send("No token provided.");
  }

  try {
    // 2. JWT 토큰을 검증합니다.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.jwtInfo = decoded; // 검증된 토큰 정보를 req.user에 저장합니다.
    next(); // 다음 미들웨어로 진행합니다.
  } catch (error) {
    // 토큰 검증에 실패한 경우 401 Unauthorized 응답을 보냅니다.
    return res.status(401).send("Failed to authenticate token.");
  }
}

function verifyTwoFA(req, res, next) {
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
      return res.status(401).send("Two Factor Authentication is not verified.");
    }

    if (decoded.isValid === false) {
      return res.status(401).send("User is not verified.");
    }

    req.jwtInfo = decoded; // 검증된 토큰 정보를 req.user에 저장합니다.
    next(); // 다음 미들웨어로 진행합니다.
  } catch (error) {
    // 토큰 검증에 실패한 경우 401 Unauthorized 응답을 보냅니다.
    return res.status(401).send("Failed to authenticate token.");
  }
}

function verifyValid(req, res, next) {
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

    if (decoded.isValid === true) {
      return res.status(401).send("User already Verified.");
    }

    req.jwtInfo = decoded; // 검증된 토큰 정보를 req.user에 저장합니다.
    next(); // 다음 미들웨어로 진행합니다.
  } catch (error) {
    // 토큰 검증에 실패한 경우 401 Unauthorized 응답을 보냅니다.
    return res.status(401).send("Failed to authenticate token.");
  }
}

function verifyAllprocess(req, res, next) {
  // 1. 요청 헤더에서 토큰을 가져옵니다.
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    // 토큰이 없는 경우 401 Unauthorized 응답을 보냅니다.
    return res.status(401).send("No token provided.");
  }

  try {
    // 2. JWT 토큰을 검증합니다.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.isValid === false) {
      return res.status(401).send("User is not verified.");
    }

    if (decoded.twofaVerified === false) {
      return res.status(401).send("Two Factor Authentication is not verified.");
    }

    req.jwtInfo = decoded; // 검증된 토큰 정보를 req.user에 저장합니다.
    next(); // 다음 미들웨어로 진행합니다.
  } catch (error) {
    // 토큰 검증에 실패한 경우 401 Unauthorized 응답을 보냅니다.
    return res.status(401).send("Failed to authenticate token.");
  }
}

function checkOauthLogin(req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      req.jwtInfo = undefined;
      next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.isOauth === false || decoded.accessToken === null) {
      return res.status(400).send("Bad Access");
    }

    req.jwtInfo = decoded;
    next();
  } catch (error) { }
}

function resetPasswordVerify(req, res, next) {
  try {
    const token = req.cookies.resetPasswordJwt;

    if (!token) {
      return res.status(400).send("Bad Access");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.isValid === false) {
      return res.status(400).send("Bad Access");
    } else if (decoded.isPasswordVerified === true) {
      return res.status(400).send("Bad Access");
    }

    req.resetPasswordVerified = decoded;
    next();
  } catch (error) { }
}

function checkChangePassword(req, res, next) {
  try {
    const token = req.cookies.resetPasswordJwt;

    if (!token) {
      return res.status(400).send("Bad Access");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.isValid === false) {
      return res.status(400).send("Bad Access");
    } else if (decoded.isPasswordVerified === false) {
      return res.status(400).send("Bad Access");
    }

    req.resetPasswordJwt = decoded;
    next();
  } catch (error) { }
}

module.exports = {
  verifyJWTToken,
  verifyTwoFA,
  verifyValid,
  verifyAllprocess,

  checkOauthLogin,
};

/*
Header, authorization
{
  'content-type': 'application/json',
  authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6bnVsbCwiZW1haWwiOiJ5ZW9taW5Ac3R1ZGVudC40MnNlb3VsLmtyIiwiaXNWYWxpZCI6ZmFsc2UsImlzT2F1dGgiOnRydWUsImFjY2Vzc1Rva2VuIjoiZTQxNDIwODY4M2JhYzE3ZjQ4N2QyNzY5ODFjODQ4YmRmZTQxYTYwNjhlZjQyY2UxOTI1MWU2NDZjYjU1ODg2NSIsInR3b2ZhVmVyaWZpZWQiOmZhbHNlLCJpYXQiOjE3MTkxNTQ5NTQsImV4cCI6MTcxOTI0MTM1NH0.52-Kq_ACUsYtAVRNb3y_qiSoYlC0XcD0flQ3EKiZtLc',
  'user-agent': 'PostmanRuntime/7.39.0',
}
*/
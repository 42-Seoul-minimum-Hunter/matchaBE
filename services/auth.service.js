const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authRepository = require('../repositories/auth.repository');
const sendEmail = require('../configs/sendEmail.js');
const { totp } = require('otplib');

const loginByUsernameAndPassword = async (username, password) => {
    try {
        const user = await authRepository.loginByUsernameAndPassword(username, password);
        return user;
    } catch (error) {
        return { error: error.message };
    }
}

const findOAuthUser = async (code) => {
    try {
        const accessToken = await authRepository.getAccessTokens(code);
        const oauthInfo = await authRepository.getOAuthInfo(accessToken);
        const user = await authRepository.findUserByEmail(oauthInfo.email);
        return { user, oauthInfo };
    } catch (error) {
        return { error: error.message };
    }
}

const generateJWT = (obj) => {
    try {
        const jwtToken = jwt.sign(obj, process.env.JWT_SECRET, { expiresIn: '24h' });
        return jwtToken;
    } catch (error) {
        return { error: error.message };
    }
}

const createTwofactorCode = async (req, email) => {
    try {
        const code = totp.generate(process.env.TWOFACTOR_SECRET);

        // 이메일 내용 구성
        const emailContent = `안녕하세요

        귀하의 2단계 인증 코드는 다음과 같습니다:
        ${code}

        이 코드는 5분 동안 유효합니다.
        감사합니다.`;

        console.log('2차 인증 코드 전송을 위한 이메일:', email, emailContent);

        const result = await sendEmail({
            to: email,
            subject: '[MATCHA] 2차 인증 코드',
            text: emailContent,
        });

        //console.log('2차 인증 코드 전송 결과:', result);

        //req.session.twoFactorCode = secret;

        if (result.accepted && result.accepted.length > 0) {
            console.log('이메일 전송 성공');
            req.session.twoFactorCode = secret;
        } else {
            console.error('이메일 전송 실패:', result);
            return { error: '이메일 전송에 실패했습니다.' };
        }


    } catch (error) {
        return { error: error.message };
    }
}

const verifyTwoFactorCode = (req, code) => {
    try {
        const secret = req.session.twoFactorCode;
        if (!secret) {
            throw new Error('2차 인증 코드가 생성되지 않았습니다.');
        }
        if (totp.verify({ secret, code })) {
            delete req.session.twoFactorCode;
            return true;
        } else {
            throw new Error('2차 인증 코드가 일치하지 않습니다.');
        }
    } catch (error) {
        return { error: error.message };
    }
};

const createRegistURL = async (req, email) => {
    try {
        const token = crypto.randomBytes(20).toString('hex');
        const expirationDate = new Date(Date.now() + 60 * 60 * 1000); // 30분 후 만료

        // 이메일 내용 구성
        const emailContent = `안녕하세요
  
        귀하의 등록 URL는 다음과 같습니다:
        ${REGISTER_VERIFY_URL}?token=${token}
    
        이 코드는 5분 동안 유효합니다.
        감사합니다.`;

        await sendEmail({
            to: email,
            subject: '[MATCHA] 회원가입 인증 URL',
            text: emailContent,
        });

        // 세션에 토큰 정보 저장
        req.session.registrationToken = {
            token,
            expirationDate,
        };

    } catch (error) {
        return { error: error.message };
    }
};

const verifyRegistURL = (req, code) => {
    try {
        // 세션에서 토큰 정보 조회
        const { token: sessionToken, expirationDate } = req.session.registrationToken;

        // 유효 기간 확인
        if (expirationDate < new Date()) {
            throw new Error('회원 가입 링크가 만료되었습니다.');
        }

        // 토큰 일치 확인
        if (sessionToken !== token) {
            throw new Error('유효하지 않은 회원 가입 링크입니다.');
        } else {
            const expirationDate = new Date(Date.now() + 60 * 60 * 1000); // 60분 후 만료
            req.session.registrationVerify = { expirationDate, isOauth: false, accessToken: null };
            delete req.session.registrationToken;
            return true;
        }

    } catch (error) {
        return { error: error.message };
    }
}

const createResetPasswordURL = async (req, username, email) => {
    try {
        await authRepository.findUserForResetPassword(username, email);

        const token = crypto.randomBytes(20).toString('hex');
        const expirationDate = new Date(Date.now() + 5 * 60 * 1000); // 5분 후 만료

        // 이메일 내용 구성
        const emailContent = `안녕하세요

        귀하의 비밀번호 초기화 URL는 다음과 같습니다:
        ${BE_RESET_PASSWORD_URL}?token=${token}

        이 코드는 5분 동안 유효합니다.
        감사합니다.`;

        await sendEmail({
            to: email,
            subject: '[MATCHA] 비밀번호 초기화 URL',
            text: emailContent,
        });

        // 세션에 토큰 정보 저장
        req.session.registrationToken = {
            token,
            expirationDate,
            email,
        };

    } catch (error) {
        return { error: error.message };
    }
}

const verifyResetPasswordURL = (req, code) => {
    try {
        // 세션에서 토큰 정보 조회
        const { token: sessionToken, expirationDate, email } = req.session.registrationToken;
        // 유효 기간 확인
        if (expirationDate < new Date()) {
            throw new Error('비밀번호 초기화 링크가 만료되었습니다.');
        }

        // 토큰 일치 확인
        if (sessionToken !== token) {
            throw new Error('유효하지 않은 비밀번호 초기화 링크입니다.');
        } else {
            const expirationDate = new Date(Date.now() + 5 * 60 * 1000); // 5분 후 만료
            req.session.resetPasswordEmail = { email, expirationDate };
            delete req.session.registrationToken;
            return true;
        }

        // 세션 정보 삭제
    } catch (error) {
        return { error: error.message };
    }
}


module.exports = {
    loginByUsernameAndPassword,
    findOAuthUser,
    generateJWT,

    createTwofactorCode,
    verifyTwoFactorCode,

    createRegistURL,
    verifyRegistURL,

    createResetPasswordURL,
    verifyResetPasswordURL

};
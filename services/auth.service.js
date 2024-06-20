const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authRepository = require('../repositories/auth.repository');
const userProfileRepository = require('../repositories/user.profile.repository');
const userRepository = require('../repositories/user.repository');
const sendEmail = require('../configs/sendEmail.js');
const { totp } = require('otplib');

const loginByUsernameAndPassword = async (username, password) => {
    try {
        const userInfo = await authRepository.findUserByUsername(username);

        if (!userInfo) {
            throw new Error('User not found');
        } else if (userInfo.is_oauth === true) {
            throw new Error('OAuth user cannot login with username and password');
        } else if (await bcypt.compare(password, userInfo.password)) {
            throw new Error('Password not match');
        }

        const profileImageInfo = await userProfileRepository.findProfileImagesById(userInfo.id);

        const user = {
            id: userInfo.id,
            username: userInfo.username,
            lastName: userInfo.last_name,
            firstName: userInfo.first_name,
            profileImage: profileImageInfo.profile_images[0],
            isValid: userInfo.is_valid,
            isOauth: userInfo.is_oauth,
        }

        return user;
    } catch (error) {
        return { error: error.message };
    }
}

const getOauthInfo = async (code) => {
    try {
        const accessToken = await authRepository.getAccessTokens(code);
        const oauthInfo = await authRepository.getOAuthInfo(accessToken);
        var user = await userRepository.findUserByEmail(oauthInfo.email);
        const profileImageInfo = await userProfileRepository.findProfileImagesById(user.id);

        user.profileImage = profileImageInfo.profile_images[0];

        return { user, oauthInfo };
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

        await sendEmail({
            to: email,
            subject: '[MATCHA] 2차 인증 코드',
            text: emailContent,
        });

        req.session.twoFactorCode = { expirationDate: new Date(Date.now() + 5 * 60 * 1000) };

    } catch (error) {
        return { error: error.message };
    }
}

const verifyTwoFactorCode = (req, code) => {
    try {
        const secret = process.env.TWOFACTOR_SECRET;
        const expirationDate = req.session.twoFactorCode.expirationDate;

        if (expirationDate < new Date()) {
            throw new Error('2차 인증 코드가 만료되었습니다.');
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
        const code = crypto.randomBytes(20).toString('hex');
        const expirationDate = new Date(Date.now() + 5 * 60 * 1000); // 5분 후 만료

        // 이메일 내용 구성
        const emailContent = `안녕하세요
  
        귀하의 등록 URL는 다음과 같습니다:
        ${process.env.REGISTER_VERIFY_URL}?code=${code}
    
        이 코드는 5분 동안 유효합니다.
        감사합니다.`;

        await sendEmail({
            to: email,
            subject: '[MATCHA] 회원가입 인증 URL',
            text: emailContent,
        });

        // 세션에 토큰 정보 저장
        req.session.registrationToken = {
            code,
            expirationDate,
        };

    } catch (error) {
        return { error: error.message };
    }
};

const verifyRegistURL = (req) => {
    try {
        // 세션에서 토큰 정보 조회
        const { token: sessionToken } = req.session.registrationToken;

        // 토큰 일치 확인
        if (sessionToken !== token) {
            throw new Error('유효하지 않은 회원 가입 링크입니다.');
        } else {
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

        const code = crypto.randomBytes(20).toString('hex');
        const expirationDate = new Date(Date.now() + 5 * 60 * 1000); // 5분 후 만료

        // 이메일 내용 구성
        const emailContent = `안녕하세요

        귀하의 비밀번호 초기화 URL는 다음과 같습니다:
        ${process.env.BE_RESET_PASSWORD_URL}?code=${code}

        이 코드는 30분 동안 유효합니다.
        감사합니다.`;

        await sendEmail({
            to: email,
            subject: '[MATCHA] 비밀번호 초기화 URL',
            text: emailContent,
        });

        // 세션에 토큰 정보 저장
        req.session.registrationToken = {
            code,
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
            const expirationDate = new Date(Date.now() + 5 * 60 * 1000); // 30분 후 만료
            req.session.resetPasswordEmail = { email, expirationDate };
            delete req.session.registrationToken;
            return true;
        }

        // 세션 정보 삭제
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

const setJwtOnCookie = (res, token) => {
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    });

    res.set('Authorization', `Bearer ${token}`);
    return res;
}


module.exports = {
    loginByUsernameAndPassword,
    getOauthInfo,
    generateJWT,

    createTwofactorCode,
    verifyTwoFactorCode,

    createRegistURL,
    verifyRegistURL,

    createResetPasswordURL,
    verifyResetPasswordURL,

    setJwtOnCookie

};
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userProfileImageRepository = require('../repositories/user.profileImage.repository.js');
const userRepository = require('../repositories/user.repository');
const sendEmail = require('../configs/sendEmail.js');
const { totp } = require('otplib');

const loginByUsernameAndPassword = async (username, password) => {
    try {
        const userInfo = await userRepository.findUserByUsername(username);

        if (!userInfo) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        } else if (userInfo.is_oauth === true) {
            const error = new Error('OAuth user cannot login with username and password');
            error.statusCode = 400;
            throw error;
        } else if (await bcypt.compare(password, userInfo.password)) {
            const error = new Error('Password not match');
            error.statusCode = 400;
            throw error;
        }

        const profileImageInfo = await userProfileImageRepository.findProfileImagesById(userInfo.id);

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
        const accessToken = await getAccessTokens(code);
        const oauthInfo = await getOAuthInfo(accessToken);
        var user = await userRepository.findUserByEmail(oauthInfo.email);

        if (!user) {
            return { user: null, oauthInfo };
        } else {
            const profileImageInfo = await userProfileImageRepository.findProfileImagesById(user.id);
            user.profileImage = profileImageInfo.profile_images[0];
            return { user, oauthInfo };
        }
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

        req.session.twoFactorExpirationDate = new Date(Date.now() + 5 * 60 * 1000);

    } catch (error) {
        return { error: error.message };
    }
}

const verifyTwoFactorCode = (expirationDate, code) => {
    try {
        const secret = process.env.TWOFACTOR_SECRET;

        if (totp.verify({ secret, code })) {
            delete req.session.twoFactorCode;
            return true;
        } else {
            return false;
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
        req.session.registrationCode = {
            code,
            expirationDate,
        };

    } catch (error) {
        return { error: error.message };
    }
};


const createResetPasswordURL = async (req, email) => {
    try {
        const userInfo = await userRepository.findUserByEmail(email);

        if (!userInfo) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

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
            const error = new Error('Password reset link has expired.');
            error.statusCode = 400;
            throw error;
        }

        // 토큰 일치 확인
        if (sessionToken !== token) {
            const error = new Error('Invalid password reset link.');
            error.statusCode = 400;
            throw error;
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

const getAccessTokens = async (code) => {
    try {
        const data = {
            'grant_type': 'authorization_code',
            'client_id': process.env.OAUTH_CLIENT_ID,
            'client_secret': process.env.OAUTH_CLIENT_SECRET,
            'code': code,
            'redirect_uri': process.env.OAUTH_CALLBACK_URI,
        };

        const response = await axios.post(process.env.OAUTH_TOKEN_URI, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.status !== 200) {
            const error = new Error('Failed to get tokens');
            error.statusCode = response.status;
            throw error;
        }
        return response.data.access_token;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const getOAuthInfo = async (accessToken) => {
    try {
        const response = await axios.get(process.env.OAUTH_USER_URI, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.status !== 200) {
            const error = new Error('Failed to get OAuth info');
            error.statusCode = response.status;
            throw error;
        }

        const oauthInfo = {
            id: null,
            email: response.data.email,
            isValid: null,
            isOauth: true,
            accessToken: accessToken,
            twofaVerified: false
        };

        return oauthInfo;
    } catch (error) {
        console.log(error);
        throw error;
    }
}


module.exports = {
    loginByUsernameAndPassword,
    getOauthInfo,
    generateJWT,

    getAccessTokens,
    getOAuthInfo,

    createTwofactorCode,
    verifyTwoFactorCode,

    createRegistURL,

    createResetPasswordURL,
    verifyResetPasswordURL,

};
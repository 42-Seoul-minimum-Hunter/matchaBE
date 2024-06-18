const { Client } = require('pg');
const bcrypt = require('bcrypt');
const axios = require('axios');

require('dotenv').config();

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

client.connect();

const loginByUsernameAndPassword = async (username, password) => {
    try {
        const userInfo = await client.query('SELECT * FROM users WHERE username = $1', [username]);

        if (userInfo.rows.length === 0) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        } else if (userInfo.rows[0].deleted_at !== null) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        } else if (userInfo.rows[0].is_OAuth === true) {
            const error = new Error('OAuth user cannot login with username and password');
            error.statusCode = 401;
            throw error;
        }

        const isPasswordMatch = await bcrypt.compare(password, userInfo.rows[0].password);

        if (!isPasswordMatch) {
            const error = new Error('Password not match');
            error.statusCode = 401;
            throw error;
        }

        const profileImageInfo = await client.query('SELECT profile_images FROM user_profile_images WHERE user_id = $1', [userInfo.rows[0].id]);

        const user = {
            id: userInfo.rows[0].id,
            username: userInfo.rows[0].username,
            lastName: userInfo.rows[0].last_name,
            firstName: userInfo.rows[0].first_name,
            profileImage: profileImageInfo.rows[0].profile_images[0],
            isValid: userInfo.rows[0].is_valid,

        };

        return user;
    } catch (error) {
        console.log(error);
        throw error;
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

        const response = await axios.post('https://api.intra.42.fr/oauth/token', data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        console.log(response);

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
        const response = await axios.get('https://api.intra.42.fr/v2/me', {
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

const findUserByEmail = async (email) => {
    try {
        const userInfo = await client.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userInfo.rows.length === 0) {
            return null;
        } else if (userInfo.rows[0].deleted_at !== null) {
            const error = new Error('User had been deleted');
            error.statusCode = 404;
            throw error;
        }

        const profileImageInfo = await client.query('SELECT profile_images FROM user_profile_images WHERE user_id = $1', [userInfo.rows[0].id]);

        const user = {
            id: userInfo.rows[0].id,
            username: userInfo.rows[0].username,
            lastName: userInfo.rows[0].last_name,
            firstName: userInfo.rows[0].first_name,
            profileImage: profileImageInfo.rows[0].profile_images[0],
            isValid: userInfo.rows[0].is_valid,
        };

        return user;


    } catch (error) {
        console.log(error);
        throw error;
    }
}

const findUserForResetPassword = async (username, email) => {
    try {
        const userInfo = await client.query('SELECT * FROM users WHERE username = $1 AND email = $2', [username, email]);

        if (userInfo.rows.length === 0) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        } else if (userInfo.rows[0].deleted_at !== null) {
            const error = new Error('User had been deleted');
            error.statusCode = 404;
            throw error;
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}


module.exports = {
    loginByUsernameAndPassword,
    getAccessTokens,
    getOAuthInfo,
    findUserByEmail,
    findUserForResetPassword
};

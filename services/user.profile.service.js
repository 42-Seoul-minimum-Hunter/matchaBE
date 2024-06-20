const userProfileImageRepository = require('../repositories/user.profileImage.repository');
const userHashtagRepository = require('../repositories/user.hashtag.repository');
const userRegionRepository = require('../repositories/user.region.repository');
const userRateRepository = require('../repositories/user.rate.repository');
const userBlockRepository = require('../repositories/user.block.repository');

const userRepository = require('../repositories/user.repository');

const getUserProfile = async (username, userId) => {
    try {

        const userInfo = await userRepository.findUserByUsername(username);
        if (!userInfo) {
            throw new Error('존재하지 않는 사용자입니다.');
        }

        const hashtagInfo = await userHashtagRepository.findHashtagById(userInfo.id);
        const regionInfo = await userRegionRepository.findRegionById(userInfo.id);
        const profileImageInfo = await userProfileImageRepository.findProfileImagesById(userInfo.id);
        const rateInfo = await userRateRepository.findRateInfoById(userInfo.id);

        let rate;
        if (rateInfo.length === 0) {
            rate = parseFloat(0);
        } else {
            const ratingScores = rateInfo.map(row => row.rate_score);
            const totalScore = ratingScores.reduce((acc, score) => acc + score, 0);
            rate = totalScore / rateInfo.length;
        }

        const blockInfo = await userBlockRepository.getBlockRelationByid(userId, userInfo.id);
        const isBlocked = blockInfo.rows.length > 0;

        const user = {
            username: userInfo.rows[0].username,
            lastName: userInfo.rows[0].last_name,
            firstName: userInfo.rows[0].first_name,
            gender: userInfo.rows[0].gender,
            preference: userInfo.rows[0].preference,
            biography: userInfo.rows[0].biography,
            age: userInfo.rows[0].age,

            hashtags: hashtagInfo,
            profileImages: profileImageInfo,
            region: regionInfo,
            rate: rate,
            isBlocked: isBlocked,
        }

        return user;
    } catch (error) {
        return { error: error.message };
    }
}

const getMyInfo = async (userId) => {
    try {

        const userInfo = await userRepository.findUserById(userId);
        if (!userInfo) {
            throw new Error('User not found');
        }

        const hashtagInfo = await userHashtagRepository.findHashtagById(userInfo.id);
        const regionInfo = await userRegionRepository.findRegionById(userInfo.id);
        const profileImageInfo = await userProfileImageRepository.findProfileImagesById(userInfo.id);
        const rateInfo = await userRateRepository.findRateInfoById(userInfo.id);

        let rate;
        if (rateInfo.length === 0) {
            rate = parseFloat(0);
        } else {
            const ratingScores = rateInfo.map(row => row.rate_score);
            const totalScore = ratingScores.reduce((acc, score) => acc + score, 0);
            rate = totalScore / rateInfo.length;
        }

        const user = {
            username: userInfo.rows[0].username,
            lastName: userInfo.rows[0].last_name,
            firstName: userInfo.rows[0].first_name,
            gender: userInfo.rows[0].gender,
            preference: userInfo.rows[0].preference,
            biography: userInfo.rows[0].biography,
            age: userInfo.rows[0].age,

            hashtags: hashtags,
            profileImages: profileImages,
            region: regionInfo.rows,
            rate: rate,
        }

        return user;
    } catch (error) {
        return { error: error.message };
    }
}

const updateUser = async (UserUpdateDto, userId) => {
    try {

        const userInfo = await userRepository.findUserByEmail(UserUpdateDto.email);

        if (userInfo) {
            throw new Error('Duplicate email address');
        }

        await userRepository.updateUserById(UserUpdateDto, userId);
        await userHashtagRepository.updateHashtagById(UserUpdateDto.hashtags, UserUpdateDto.userId);
        await userRegionRepository.updateRegionById(UserUpdateDto.region, UserUpdateDto.userId);
        await userProfileImageRepository.updateProfileImagesById(UserUpdateDto.profileImages, UserUpdateDto.userId);
    } catch (error) {
        return { error: error.message };
    }
}



module.exports = {
    getUserProfile,
    getMyInfo,
    updateUser
};
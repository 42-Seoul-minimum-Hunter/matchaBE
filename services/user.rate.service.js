const userRateRepository = require('../repositories/user.rate.repository');

const rateUser = async (ratedUsername, rateScore, userId) => {
    try {
        const ratedUserInfo = await userRateRepository.findUserByUsername(ratedUsername);
        if (!ratedUserInfo) {
            throw new Error('User not found');
        }
        await userRateRepository.rateUser(ratedUserInfo.id, rateScore, userId);
    } catch (error) {
        return { error: error.message };
    }
}

module.exports = {
    rateUser
};
const userRateRepository = require('../repositories/user.rate.repository');

const rateUser = async (UserRateDto, userId) => {
    try {
        await userRateRepository.rateUser(UserRateDto, userId);
    } catch (error) {
        return { error: error.message };
    }
}

module.exports = {
    rateUser
};
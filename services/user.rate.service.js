const bcrypt = require('bcrypt');

const UserRateRepository = require('../repositories/user.rate.repository');

const rateUser = async (UserRateDto, userId) => {
    try {
        await UserRateRepository.rateUser(UserRateDto, userId);
    } catch (error) {
        return { error: error.message };
    }
}

module.exports = {
    rateUser
};
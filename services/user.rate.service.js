const bcrypt = require('bcrypt');

const UserRateRepository = require('../repositories/user.rate.repository');

const rateUser = async (UserRateDto, user_id) => {
    try {
        await UserRateRepository.rateUser(UserRateDto, user_id);
    } catch (error) {
        return { error: error.message };
    }
}

module.exports = {
    rateUser
};
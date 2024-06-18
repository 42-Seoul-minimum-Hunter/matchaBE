const bcrypt = require('bcrypt');

const UserProfileRepository = require('../repositories/user.profile.repository');

const findUserByUsername = async (username, user_id) => {
    try {
        const user = await UserProfileRepository.findUserByUsername(username, user_id);
        return user;
    } catch (error) {
        return { error: error.message };
    }
}



module.exports = {
    findUserByUsername
};
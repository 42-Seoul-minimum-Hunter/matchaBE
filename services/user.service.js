const bcrypt = require('bcrypt');

const UserRepository = require('../repositories/user.repository');

// https://goodmemory.tistory.com/137
const createUser = async (UserCreateDto) => {
    try {
        const hashed = await bcrypt.hash(UserCreateDto.password, 10);
        UserCreateDto.password = hashed;
        UserRepository.createUser(UserCreateDto);
        //UserRepository.saveHashtag(UserCreateDto);
        //UserRepository.saveLocation(UserCreateDto);
        //UserRepository.saveprofileImage(UserCreateDto);
        return UserCreateDto;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = {
    createUser
};
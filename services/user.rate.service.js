const userRateRepository = require("../repositories/user.rate.repository");

const rateUser = async (ratedUsername, rateScore, userId) => {
  try {
    const ratedUserInfo = await userRateRepository.findUserByUsername(
      ratedUsername
    );
    if (!ratedUserInfo) {
      const error = new Error("Rate user not found.");
      error.status = 404;
      throw error;
    }
    await userRateRepository.rateUser(ratedUserInfo.id, rateScore, userId);
  } catch (error) {
        console.log(error);
    throw error;
  }
};

module.exports = {
  rateUser,
};

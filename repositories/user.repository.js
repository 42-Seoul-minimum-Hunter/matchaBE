const { Client } = require("pg");
const fs = require("fs");
const logger = require("../configs/logger.js");
const userRegionRepository = require("./user.region.repository.js");

require("dotenv").config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

client.connect();

const createUser = async (userInfo, email, password) => {
  try {
    logger.info(
      "user.repository.js createUser: " +
        JSON.stringify(userInfo) +
        ", " +
        email +
        ", " +
        password
    );
    const {
      username,
      lastName,
      firstName,
      gender,
      preference,
      biography,
      age,
    } = userInfo;

    const result = await client.query(
      `INSERT INTO users (
                email,
                username,
                password,
                last_name,
                first_name,
                gender,
                preference,
                biography,
                age,
                connected_at,
                created_at,
                deleted_at,
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), now(), null, now())
            RETURNING *`,
      [
        email,
        username,
        password,
        lastName,
        firstName,
        gender,
        preference,
        biography,
        age,
      ]
    );

    return result.rows[0].id;
  } catch (error) {
    logger.error("user.repository.js createUser: " + error);
    throw error;
  }
};

const deleteUserById = async (id) => {
  try {
    // 유저 삭제 처리
    logger = logger.info("user.repository.js deleteUserById: " + id);
    await client.query(
      `UPDATE users 
             SET deleted_at = now(), updated_at = now()
             WHERE id = $1`,
      [id]
    );
  } catch (error) {
    logger.error("user.repository.js deleteUserById: " + error);
    throw error;
  }
};

const changePassword = async (hashedPassword, email) => {
  try {
    logger.info(
      "user.repository.js changePassword: " + hashedPassword + ", " + email
    );
    await client.query(
      `UPDATE users
             SET password = $1, updated_at = now()
             WHERE email = $2 AND deleted_at IS NULL`,
      [hashedPassword, email]
    );
  } catch (error) {
    logger.error("user.repository.js changePassword: " + error);
    throw error;
  }
};

const findUserByDefaultFilter = async (id, preference, si, gu, hashtags) => {
  try {
    logger.info(
      "user.repository.js findUserByDefaultFilter: " +
        id +
        ", " +
        preference +
        ", " +
        si +
        ", " +
        gu +
        ", " +
        hashtags
    );

    // 유저의 성향에 따른 쿼리 조건 설정
    let genderCondition;
    if (preference === "none" || preference === "both") {
      genderCondition = "u.gender IN ('Male', 'Female')";
    } else {
      genderCondition = "u.gender = $1";
    }

    // 공통 해시태그 수 계산을 위한 서브쿼리
    const subQuery = `
      SELECT u.id, COUNT(uh.hashtags) AS common_hashtags
      FROM users u
      JOIN user_hashtags uh ON u.id = uh.user_id
      WHERE $2 && uh.hashtags
      GROUP BY u.id
    `;

    let mainQuery = `
    SELECT u.*, ur.si, ur.gu, s.common_hashtags
    FROM users u
    JOIN user_regions ur ON u.id = ur.user_id
    JOIN (
      ${subQuery}
    ) s ON u.id = s.id
    WHERE ${genderCondition} AND u.deleted_at IS NULL
      AND ur.si = $3 AND ur.gu = $4
  `;

    // 전체 사용자 수 계산
    const totalCount = await client.query(mainQuery, [
      preference,
      hashtags,
      si,
      gu,
    ]);

    // Fetch the user data
    const preferenceUsers = await client.query(mainQuery, [
      preference,
      hashtags,
      si,
      gu,
    ]);

    // 사용자 평균 평점 계산 및 필터링
    const filteredUserInfos = [];
    for (const userInfo of preferenceUsers.rows) {
      const ratingInfo = await client.query(
        "SELECT rate_score FROM user_ratings WHERE rated_id = $1",
        [userInfo.id]
      );
      let rate;
      if (ratingInfo.rows.length === 0) {
        rate = parseFloat(0);
      } else {
        const ratingScores = ratingInfo.rows.map((row) => row.rate_score);
        const totalScore = ratingScores.reduce((acc, score) => acc + score, 0);
        rate = totalScore / ratingInfo.rows.length;
      }
      userInfo.rate = rate;
      filteredUserInfos.push(userInfo);
    }

    //console.log('infologs: ' + filteredUserInfos);

    const UserInfo = await Promise.all(
      filteredUserInfos
        .sort((a, b) => {
          if (a.rate < b.rate) return 1;
          if (a.rate > b.rate) return -1;
          return 0;
        })
        .map(async (userInfo) => {
          if (userInfo.id !== id) {
            const { rows } = await client.query(
              "SELECT profile_images FROM user_profile_images WHERE user_id = $1",
              [userInfo.id]
            );
            const profileImages =
              rows.length > 0 ? rows[0].profile_images : null;

            const userHashtags = await client.query(
              `SELECT hashtags FROM user_hashtags WHERE user_id = $1`,
              [userInfo.id]
            );

            //console.log("hashtag: " + userHashtags.rows[0].hashtags);

            const commonHashtags = userHashtags.rows[0].hashtags.filter(
              (value) => hashtags.includes(value)
            ).length;

            const userRegions = userRegionRepository.findRegionById(
              userInfo.id
            );

            return {
              id: userInfo.id,
              username: userInfo.username,
              age: userInfo.age,
              profileImages: profileImages ? profileImages[0] : null,
              rate: userInfo.rate,
              commonHashtags: commonHashtags,
              si: userRegions.si,
              gu: userRegions.gu,
            };
          }
        })
    );

    return {
      users: UserInfo,
      totalCount: totalCount,
    };
  } catch (error) {
    logger.error("user.repository.js findUserByDefaultFilter: " + error);
    throw error;
  }
};

const findUserByFilter = async (filter, id) => {
  try {
    logger.info(
      "user.repository.js findUserByFilter: " +
        JSON.stringify(filter) +
        ", " +
        id
    );

    const { hashtags, minAge, maxAge, si, gu, minRate, maxRate } = filter;

    let query = "SELECT u.* FROM users u";
    const params = [];

    // JOIN 추가
    query += " JOIN user_hashtags uh ON u.id = uh.user_id";
    query += " JOIN user_regions ur ON u.id = ur.user_id";

    // WHERE 조건 생성
    let whereClauses = [];

    // hashtags 조건
    if (hashtags) {
      whereClauses.push("$1 <@ uh.hashtags");
      params.push(hashtags);
    }

    // si 조건
    if (si) {
      whereClauses.push("ur.si = $" + (params.length + 1));
      params.push(si);
    }

    // gu 조건
    if (gu) {
      whereClauses.push("ur.gu = $" + (params.length + 1));
      params.push(gu);
    }

    // minAge 및 maxAge 조건
    if (minAge && maxAge) {
      whereClauses.push(
        "u.age >= $" +
          (params.length + 1) +
          " AND u.age <= $" +
          (params.length + 2)
      );
      params.push(minAge, maxAge);
    } else if (minAge) {
      whereClauses.push("u.age >= $" + (params.length + 1));
      params.push(minAge);
    } else if (maxAge) {
      whereClauses.push("u.age <= $" + (params.length + 1));
      params.push(maxAge);
    }

    // WHERE 절 추가
    if (whereClauses.length > 0) {
      query += " WHERE " + whereClauses.join(" AND ");
    }

    const totalCount = (await client.query(query, params)).rows.length;

    //console.log("totalCount: " + totalCount);

    const userInfos = await client.query(query, params);

    //console.log(userInfos.rows);

    // 사용자 평균 평점 계산 및 필터링
    const filteredUserInfos = [];
    for (const userInfo of userInfos.rows) {
      const ratingInfo = await client.query(
        "SELECT rate_score FROM user_ratings WHERE rated_id = $1",
        [userInfo.id]
      );
      let rate;
      if (ratingInfo.rows.length === 0) {
        rate = parseFloat(0);
      } else {
        const ratingScores = ratingInfo.rows.map((row) => row.rate_score);
        const totalScore = ratingScores.reduce((acc, score) => acc + score, 0);
        rate = totalScore / ratingInfo.rows.length;
      }

      // minRate와 maxRate에 따른 필터링 로직
      const isMinRateValid = minRate !== undefined;
      const isMaxRateValid = maxRate !== undefined;

      if (!isMinRateValid && !isMaxRateValid) {
        // 두 값 모두 없음: 모든 사용자 추가
        userInfo.rate = rate;
        filteredUserInfos.push(userInfo);
      } else if (isMinRateValid && !isMaxRateValid) {
        // minRate만 있음: minRate 이상인 사용자 추가
        if (rate >= minRate) {
          userInfo.rate = rate;
          filteredUserInfos.push(userInfo);
        }
      } else if (!isMinRateValid && isMaxRateValid) {
        // maxRate만 있음: maxRate 이하인 사용자 추가
        if (rate <= maxRate) {
          userInfo.rate = rate;
          filteredUserInfos.push(userInfo);
        }
      } else if (isMinRateValid && isMaxRateValid) {
        // 둘 다 있을 때: minRate 이상 maxRate 이하인 사용자 추가
        if (rate >= minRate && rate <= maxRate) {
          userInfo.rate = rate;
          filteredUserInfos.push(userInfo);
        }
      }
    }

    const UserInfo = await Promise.all(
      filteredUserInfos
        .sort((a, b) => {
          if (a.rate < b.rate) return 1;
          if (a.rate > b.rate) return -1;
          return 0;
        })
        .map(async (userInfo) => {
          if (id !== userInfo.id) {
            const { rows } = await client.query(
              "SELECT profile_images FROM user_profile_images WHERE user_id = $1",
              [userInfo.id]
            );
            const profileImages =
              rows.length > 0 ? rows[0].profile_images : null;

            const userRegions = userRegionRepository.findRegionById(
              userInfo.id
            );

            return {
              id: userInfo.id,
              username: userInfo.username,
              age: userInfo.age,
              profileImages: profileImages ? profileImages[0] : null,
              rate: userInfo.rate,
              si: userRegions.si,
              gu: userRegions.gu,
            };
          }
        })
    );

    return {
      users: UserInfo,
      totalCount: totalCount,
    };

    //return UserInfo;
  } catch (error) {
    logger.error("user.repository.js findUserByFilter: " + error);
    throw error;
  }
};

const findUserByUsername = async (username) => {
  try {
    logger.info("user.repository.js findUserByUsername: " + username);
    const { rows } = await client.query(
      "SELECT * FROM users WHERE username = $1 AND deleted_at IS NULL",
      [username]
    );
    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  } catch (error) {
    logger.error("user.repository.js findUserByUsername: " + error);
    throw error;
  }
};

const findUserByEmail = async (email) => {
  try {
    logger.info("user.repository.js findUserByEmail: " + email);
    const { rows } = await client.query(
      `SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL`,
      [email]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  } catch (error) {
    logger.error("user.repository.js findUserByEmail: " + error);
    throw error;
  }
};

const findUserById = async (id) => {
  try {
    logger.info("user.repository.js findUserById: " + id);
    const { rows } = await client.query(
      `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  } catch (error) {
    logger.error("user.repository.js findUserById: " + error);
    throw error;
  }
};

const updateUserById = async (UserUpdateDto, id) => {
  try {
    logger.info(
      "user.repository.js updateUserById: " +
        JSON.stringify(UserUpdateDto) +
        ", " +
        id
    );
    const { email, lastName, firstName, gender, preference, biography, age } =
      UserUpdateDto;

    const duplicatedEmail = await findUserByEmail(email);
    if (duplicatedEmail) {
      await client.query(
        `
              UPDATE users
              SET 
                  last_name = $1,
                  first_name = $2,
                  gender = $3,
                  preference = $4,
                  biography = $5,
                  age = $6,
                  updated_at = now()
              WHERE id = $7
              RETURNING *
          `,
        [lastName, firstName, gender, preference, biography, age, id]
      );
    } else {
      await client.query(
        `
              UPDATE users
              SET email = $1,
                  last_name = $2,
                  first_name = $3,
                  gender = $4,
                  preference = $5,
                  biography = $6,
                  age = $7,
                  updated_at = now()
              WHERE id = $8
              RETURNING *
          `,
        [email, lastName, firstName, gender, preference, biography, age, id]
      );
    }
  } catch (error) {
    logger.error("user.repository.js updateUserById: " + error);
    throw error;
  }
};

const updateUserValidByEmail = async (email) => {
  try {
    logger.info("user.repository.js updateUserValidByEmail: " + email);
    await client.query(
      `UPDATE users
             SET is_valid = true, updated_at = now()
             WHERE email = $1 AND deleted_at IS NULL`,
      [email]
    );
  } catch (error) {
    logger.error("user.repository.js updateUserValidByEmail: " + error);
    throw error;
  }
};

const updateConnectedAtById = async (id) => {
  try {
    logger.info("user.repository.js updateConnectedAtById: " + id);
    await client.query(
      `UPDATE users
             SET connected_at = now(), updated_at = now()
             WHERE id = $1`,
      [id]
    );
  } catch (error) {
    logger.error("user.repository.js updateConnectedAtById: " + error);
    throw error;
  }
};

module.exports = {
  createUser,
  deleteUserById,

  changePassword,

  findUserByFilter,
  findUserByDefaultFilter,

  findUserByUsername,
  findUserByEmail,
  findUserById,

  updateUserById,
  updateUserValidByEmail,
  updateConnectedAtById,
};

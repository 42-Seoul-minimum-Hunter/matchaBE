const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

client.connect();

const createUser = async (UserCreateDto) => {
  try {
    const {
      email,
      username,
      password,
      lastName,
      firstName,
      gender,
      preference,
      biography,
      age,
      isGpsAllowed,
      isOauth,
    } = UserCreateDto;

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
                is_oauth,
                is_valid,
                is_gps_allowed,
                connected_at,
                created_at,
                deleted_at,
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, now(), now(), null, now())
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
        isOauth,
        false,
        isGpsAllowed,
      ]
    );

    return result.rows[0].id;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const deleteUserById = async (id) => {
  try {
    // 유저 삭제 처리
    await client.query(
      `UPDATE users 
             SET deleted_at = now(), updated_at = now()
             WHERE id = $1`,
      [id]
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const changePassword = async (hashedPassword, email) => {
  try {
    await client.query(
      `UPDATE users
             SET password = $1, updated_at = now()
             WHERE email = $2 AND deleted_at IS NULL`,
      [hashedPassword, email]
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const findUserByFilter = async (filter, page, pageSize) => {
  try {
    //console.log(filter)

    var { hashtags, minAge, maxAge, minRate, maxRate, si, gu } = filter;

    let query = "SELECT u.* FROM users u";
    const params = [];

    // hashtags 조건 추가
    if (hashtags) {
      query += " JOIN user_hashtags uh ON u.id = uh.user_id";
    }

    if (si) {
      query += " JOIN user_regions ur ON u.id = ur.user_id";
    }

    if (hashtags) {
      query += " WHERE $1 <@ uh.hashtags";
      params.push(hashtags);
    }

    // si, gu 조건 추가
    if (si) {
      query += " AND ur.si = $" + (params.length + 1);
      params.push(si);

      if (gu) {
        query += " AND ur.gu = $" + (params.length + 1);
        params.push(gu);
      }
    }

    // minAge, maxAge 조건 추가
    if (minAge) {
      query += " AND u.age >= $" + (params.length + 1);
      params.push(minAge);
    }
    if (maxAge) {
      query += " AND u.age <= $" + (params.length + 1);
      params.push(maxAge);
    }

    if (!minRate) {
      minRate = parseFloat(0);
    }

    if (!maxRate) {
      maxRate = parseFloat(5);
    }

    // LIMIT와 OFFSET을 추가하여 페이지네이션 구현
    query +=
      " LIMIT $" + (params.length + 1) + " OFFSET $" + (params.length + 2);
    params.push(pageSize);
    params.push((page - 1) * pageSize);

    const userInfos = await client.query(query, params);

    // 전체 사용자 수 계산
    const totalCountQuery =
      "SELECT COUNT(*) AS total_count FROM (" + query + ") AS subquery";
    const totalCountResult = await client.query(totalCountQuery, params);
    const totalCount = totalCountResult.rows[0].total_count;

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
        console.log("rate: " + rate);
      } else {
        const ratingScores = ratingInfo.rows.map((row) => row.rate_score);
        const totalScore = ratingScores.reduce((acc, score) => acc + score, 0);
        rate = totalScore / ratingInfo.rows.length;
      }

      if (rate >= minRate && rate <= maxRate) {
        userInfo.rate = rate;
        filteredUserInfos.push(userInfo);
      }
    }

    //console.log('infologs: ' + filteredUserInfos);

    const UserInfo = await Promise.all(
      filteredUserInfos
        .sort((a, b) => {
          if (a.connected_at < b.connected_at) return -1;
          if (a.connected_at > b.connected_at) return 1;
          return 0;
        })
        .map(async (userInfo) => {
          const { rows } = await client.query(
            "SELECT profile_images FROM user_profile_images WHERE user_id = $1",
            [userInfo.id]
          );
          const profileImages = rows.length > 0 ? rows[0].profile_images : null;

          return {
            username: userInfo.username,
            age: userInfo.age,
            profileImages: profileImages ? profileImages[0] : null,
            rate: userInfo.rate,
          };
        })
    );

    return {
      users: UserInfo,
      totalCount: totalCount,
    };

    //return UserInfo;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const findUserByUsername = async (username) => {
  try {
    const { rows } = await client.query(
      "SELECT * FROM users WHERE username = $1 AND deleted_at IS NULL",
      [username]
    );
    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const findUserByEmail = async (email) => {
  try {
    const { rows } = await client.query(
      `SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL`,
      [email]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const findUserById = async (id) => {
  try {
    const { rows } = await client.query(
      `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateUserById = async (UserUpdateDto, id) => {
  try {
    const {
      email,
      password,
      lastName,
      firstName,
      gender,
      preference,
      biography,
      age,
      isGpsAllowed,
    } = UserUpdateDto;

    await client.query(
      `
            UPDATE users
            SET email = $1,
                password = $2,
                last_name = $3,
                first_name = $4,
                gender = $5,
                preference = $6,
                biography = $7,
                age = $8,
                is_gps_allowed = $9
            WHERE id = $10
            RETURNING *
        `,
      [
        email,
        password,
        lastName,
        firstName,
        gender,
        preference,
        biography,
        age,
        isGpsAllowed,
        id,
      ]
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateUserValidByEmail = async (email) => {
  try {
    await client.query(
      `UPDATE users
             SET is_valid = true, updated_at = now()
             WHERE email = $1 AND deleted_at IS NULL`,
      [email]
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  createUser,
  deleteUserById,

  changePassword,

  findUserByFilter,

  findUserByUsername,
  findUserByEmail,
  findUserById,

  updateUserById,
  updateUserValidByEmail,
};

const { Client } = require('pg');

require("dotenv").config();

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });


const makeMockData = async () => {
    try {

        await client.connect();

        for (let i = 0; i < 500 ; i++) {
            // 유저 데이터
            await client.query(`
            INSERT INTO users 
            (email, username, password, last_name, first_name,
            gender, preference, biography, age, is_oauth, is_valid, is_gps_allowed, connected_at,
            updated_at, created_at, deleted_at)
            VALUES 
            ($1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11, $12, '2020-01-01 00:00:00', '2020-01-01 00:00:00', '2020-01-01 00:00:00', NULL);
            `),
            ['email'+ i.toString() +'@gmail.com', 'User'+ i.toString(), 'password', 'min', 'yeomin', 
                'male', 'female', 'hello, world!', '22', 'false', 'true', 'true'];
                
                // 유저 프로필 데이터
            await client.query(`
                INSERT INTO user_hashtags
                (user_id, hashtags, updated_at)
                VALUES
                ($1, $2, $3);
            `),
            [i.toString(), 'running, game', '2020-01-01 00:00:00'];

                // 유저 프로필 데이터
            await client.query(`
                INSERT INTO user_profile_images
                (user_id, profile_images, updated_at)
                VALUES
                ($1, $2, $3);
            `),[i.toString(), 'profile_image', '2020-01-01 00:00:00'];

            // 유저 위치 데이터
            await client.query(`
                INSERT INTO user_regions
                (user_id, region, updated_at)
                VALUES
                ($1, $2, $3);
            `),[i.toString(), 'seoul', '2020-01-01 00:00:00'];
        }

    }
    catch (error) {
        console.error(error);
    }
};

module.exports = makeMockData;
const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const UserCreateDto = require('../dtos/user.create.dto');

const createUser = async (UserCreateDto) => {
    try {
        client.connect();
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
            gpsAllowedAt,
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
                gps_allowed_at,
                connected_at,
                created_at,
                deleted_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, now(), now(), null)
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
                false,
                false,
                gpsAllowedAt,
            ]
        ).then((res) => {
            client.end();
        });

        return UserCreateDto;
    } catch (error) {
        throw new Error(error.message);
    }
}


module.exports = {
    createUser
};
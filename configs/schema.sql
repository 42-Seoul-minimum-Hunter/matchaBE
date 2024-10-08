 DROP SCHEMA public CASCADE;
 CREATE SCHEMA public;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(50) UNIQUE NOT NULL,
  username VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(255),
  last_name VARCHAR(30) NOT NULL,
  first_name VARCHAR(30) NOT NULL,
  gender VARCHAR(10) NOT NULL,
  preference VARCHAR(15),
  biography VARCHAR(255),
  age INT NOT NULL,
  connected_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  is_oauth BOOLEAN NOT NULL,
  is_valid BOOLEAN NOT NULL,
  is_gps_allowed BOOLEAN NOT NULL,
  is_twofa BOOLEAN NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS user_block_histories (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  blocked_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_hashtags (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  hashtags text[] NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);


CREATE TABLE IF NOT EXISTS user_profile_images (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  profile_images VARCHAR[] NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS user_ratings (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  rated_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  rate_score FLOAT NOT NULL,
  rated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS user_regions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  si VARCHAR(20) NOT NULL,
  gu VARCHAR(20) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS user_reports(
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    reported_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS user_view_histories (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  viewed_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS user_like_histories (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  liked_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP
);


CREATE TABLE IF NOT EXISTS user_chat_rooms (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  chated_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_chat_histories (
  id SERIAL PRIMARY KEY,
  room_id INT REFERENCES user_chat_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS user_alarm_histories (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  alarmed_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  alarm_type VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP
);

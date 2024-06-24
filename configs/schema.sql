 DROP SCHEMA public CASCADE;
 CREATE SCHEMA public;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(30) UNIQUE NOT NULL,
  username VARCHAR(15) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  first_name VARCHAR(30) NOT NULL,
  gender VARCHAR(10) NOT NULL,
  preference VARCHAR(15),
  biography VARCHAR(255),
  age INT NOT NULL,
  is_oauth BOOLEAN NOT NULL,
  is_valid BOOLEAN NOT NULL,
  is_gps_allowed BOOLEAN NOT NULL ,
  connected_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP
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
  hashtags VARCHAR[] NOT NULL,
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
  rate_score INT NOT NULL,
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
    reason VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS user_view_histories (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  viewed_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS user_like_histories (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  liked_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

INSERT INTO users 
(email, username, password, last_name, first_name,
gender, preference, biography, age, is_oauth, is_valid, is_gps_allowed, connected_at,
updated_at, created_at, deleted_at)
VALUES 
('email@gmail.com', 'User1', 'password', 'min', 'yeomin', 'male', 'female',
'hello, world!', '22', 'false', 'true', 'true', '2020-01-01 00:00:00', '2020-01-01 00:00:00', '2020-01-01 00:00:00', NULL);

INSERT INTO user_hashtags
(user_id, hashtags, updated_at)
VALUES
(1, ARRAY['running', 'game'], '2020-01-01 00:00:00');

INSERT INTO user_profile_images
(user_id, profile_images, updated_at)
VALUES
(1, ARRAY['https://naver.com'], '2020-01-01 00:00:00');

INSERT INTO user_regions
(user_id, si, gu, updated_at)
VALUES
(1, '서울', '강남구', '2020-01-01 00:00:00');


INSERT INTO users 
(email, username, password, last_name, first_name,
gender, preference, biography, age, is_oauth, is_valid, is_gps_allowed, connected_at,
updated_at, created_at, deleted_at)
VALUES 
('email@naver.com', 'User2', 'password', 'min', 'yeomin', 'male', 'female',
'hello, world!', '22', 'false', 'true', 'true', '2020-01-01 00:00:00', '2020-01-01 00:00:00', '2020-01-01 00:00:00', NULL);

INSERT INTO users 
(email, username, password, last_name, first_name,
gender, preference, biography, age, is_oauth, is_valid, is_gps_allowed, connected_at,
updated_at, created_at, deleted_at)
VALUES 
('email@yahoo.com', 'User3', 'password', 'min', 'yeomin', 'male', 'female',
'hello, world!', '22', 'false', 'true', 'true', '2020-01-01 00:00:00', '2020-01-01 00:00:00', '2020-01-01 00:00:00', NULL);


INSERT INTO user_hashtags
(user_id, hashtags, updated_at)
VALUES
(2, ARRAY['running', 'game'], '2020-01-01 00:00:00');

INSERT INTO user_profile_images
(user_id, profile_images, updated_at)
VALUES
(2, ARRAY['https://naver.com'], '2020-01-01 00:00:00');

INSERT INTO user_hashtags
(user_id, hashtags, updated_at)
VALUES
(3, ARRAY['running', 'game'], '2020-01-01 00:00:00');

INSERT INTO user_profile_images
(user_id, profile_images, updated_at)
VALUES
(3, ARRAY['https://naver.com'], '2020-01-01 00:00:00');

INSERT INTO user_regions
(user_id, si, gu, updated_at)
VALUES
(2, '서울', '강남구', '2020-01-01 00:00:00');

INSERT INTO user_like_histories
(user_id, liked_id, created_at, viewed_at)
VALUES
(1, 2, '2020-01-01 00:00:00', '2020-01-01 00:00:00');

INSERT INTO user_like_histories
(user_id, liked_id, created_at, viewed_at)
VALUES
(2, 1, '2020-01-01 00:00:00', '2020-01-01 00:00:00');

INSERT INTO user_chat_rooms
(user_id, chated_id, created_at, deleted_at)
VALUES
(1, 2, '2020-01-01 00:00:00', NULL);

INSERT INTO user_chat_rooms
(user_id, chated_id, created_at, deleted_at)
VALUES
(1, 3, '2020-01-01 00:00:00', NULL);

INSERT INTO user_chat_histories
(room_id, sender_id, content, created_at, viewed_at)
VALUES
(1, 2, 'hello', '2020-01-01 00:00:00', '2020-01-01 00:00:00');

INSERT INTO user_chat_histories
(room_id, sender_id, content, created_at, viewed_at)
VALUES
(2, 1, 'world', '2020-01-01 00:00:00', '2020-01-01 00:00:00');
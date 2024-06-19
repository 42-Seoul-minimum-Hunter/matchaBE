CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(30) UNIQUE NOT NULL,
  username VARCHAR(15) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
    first_name VARCHAR(30) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    preference VARCHAR(10),
    biography VARCHAR(255),
    age INT NOT NULL,
    is_oauth BOOLEAN NOT NULL,
    is_valid BOOLEAN NOT NULL,
    gps_allowed_at TIMESTAMP,
    connected_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_block_histories (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  blocked_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
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
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
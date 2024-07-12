INSERT INTO users 
(email, username, password, last_name, first_name,
gender, preference, biography, age, is_oauth, is_valid, is_gps_allowed, connected_at,
updated_at, created_at, deleted_at)
VALUES 
('koryum30@gmail.com', 'User1', 'password', 'min', 'yeomin', 'Male', 'Female',
'hello, world!', '22', 'false', 'true', 'true', '2020-01-01 00:00:00', '2020-01-01 00:00:00', '2020-01-01 00:00:00', NULL);

INSERT INTO user_hashtags
(user_id, hashtags, updated_at)
VALUES
(701, ARRAY['달리기', '사업'], '2020-01-01 00:00:00');

INSERT INTO user_profile_images
(user_id, profile_images, updated_at)
VALUES
(701, ARRAY['http://dummyimage.com/154x100.png/dddddd/00000', 'http://dummyimage.com/154x100.png/dddddd/00000', 'http://dummyimage.com/154x100.png/dddddd/00000'], '2020-01-01 00:00:00');

INSERT INTO user_regions
(user_id, si, gu, updated_at)
VALUES
(701, '서울', '강남구', '2020-01-01 00:00:00');

INSERT INTO users 
(email, username, password, last_name, first_name,
gender, preference, biography, age, is_oauth, is_valid, is_gps_allowed, connected_at,
updated_at, created_at, deleted_at)
VALUES 
('miyu@student.42seoul.kr', 'User2', 'password', 'min', 'yeomin', 'Female', 'Male',
'hello, world!', '22', 'false', 'true', 'true', '2020-01-01 00:00:00', '2020-01-01 00:00:00', '2020-01-01 00:00:00', NULL);

INSERT INTO user_hashtags
(user_id, hashtags, updated_at)
VALUES
(702, ARRAY['달리기', '사업'], '2020-01-01 00:00:00');

INSERT INTO user_profile_images
(user_id, profile_images, updated_at)
VALUES
(702, ARRAY['http://dummyimage.com/154x100.png/dddddd/00000', 'http://dummyimage.com/154x100.png/dddddd/00000', 'http://dummyimage.com/154x100.png/dddddd/00000'], '2020-01-01 00:00:00');

INSERT INTO user_regions
(user_id, si, gu, updated_at)
VALUES
(702, '서울', '강남구', '2020-01-01 00:00:00');

INSERT INTO users 
(email, username, password, last_name, first_name,
gender, preference, biography, age, is_oauth, is_valid, is_gps_allowed, connected_at,
updated_at, created_at, deleted_at)
VALUES 
('yeomin@student.42seoul.kr', 'User3', 'password', 'min', 'yeomin', 'Male', 'Female',
'hello, world!', '22', 'false', 'true', 'true', '2020-01-01 00:00:00', '2020-01-01 00:00:00', '2020-01-01 00:00:00', NULL);

INSERT INTO user_hashtags
(user_id, hashtags, updated_at)
VALUES
(703, ARRAY['달리기', '사업'], '2020-01-01 00:00:00');

INSERT INTO user_profile_images
(user_id, profile_images, updated_at)
VALUES
(703, ARRAY['http://dummyimage.com/154x100.png/dddddd/00000', 'http://dummyimage.com/154x100.png/dddddd/00000', 'http://dummyimage.com/154x100.png/dddddd/00000'], '2020-01-01 00:00:00');

INSERT INTO user_regions
(user_id, si, gu, updated_at)
VALUES
(703, '서울', '강남구', '2020-01-01 00:00:00');

INSERT INTO users 
(email, username, password, last_name, first_name,
gender, preference, biography, age, is_oauth, is_valid, is_gps_allowed, connected_at,
updated_at, created_at, deleted_at)
VALUES 
('oooo0413@naver.com', 'User4', 'password', 'min', 'yeomin', 'Male', 'Female',
'hello, world!', '22', 'false', 'true', 'true', '2020-01-01 00:00:00', '2020-01-01 00:00:00', '2020-01-01 00:00:00', NULL);

INSERT INTO user_hashtags
(user_id, hashtags, updated_at)
VALUES
(704, ARRAY['달리기', '사업'], '2020-01-01 00:00:00');

INSERT INTO user_profile_images
(user_id, profile_images, updated_at)
VALUES
(704, ARRAY['http://dummyimage.com/154x100.png/dddddd/00000', 'http://dummyimage.com/154x100.png/dddddd/00000', 'http://dummyimage.com/154x100.png/dddddd/00000'], '2020-01-01 00:00:00');

INSERT INTO user_regions
(user_id, si, gu, updated_at)
VALUES
(704, '서울', '강남구', '2020-01-01 00:00:00');

INSERT INTO user_ratings
(user_id, rated_id, rate_score, rated_at)
VALUES
(701, 699, 3, '2020-01-01 00:00:00');

INSERT INTO user_ratings
(user_id, rated_id, rate_score, rated_at)
VALUES
(702, 699, 4, '2020-01-01 00:00:00');

INSERT INTO user_ratings
(user_id, rated_id, rate_score, rated_at)
VALUES
(701, 696, 3, '2020-01-01 00:00:00');

INSERT INTO user_ratings
(user_id, rated_id, rate_score, rated_at)
VALUES
(702, 696, 4, '2020-01-01 00:00:00');


--INSERT INTO user_like_histories
--(user_id, liked_id, created_at)
--VALUES
--(701, 702, '2020-01-01 00:00:00');

--INSERT INTO user_like_histories
--(user_id, liked_id, created_at)
--VALUES
--(702, 701, '2020-01-01 00:00:00');

INSERT INTO user_chat_rooms
(user_id, chated_id, created_at, deleted_at)
VALUES
(701, 702, '2020-01-01 00:00:00', NULL);

INSERT INTO user_chat_rooms
(user_id, chated_id, created_at, deleted_at)
VALUES
(701, 703, '2020-01-01 00:00:00', NULL);

--INSERT INTO user_chat_histories
--(room_id, sender_id, content, created_at)
--VALUES
--(1, 702, 'hello', '2020-01-01 00:00:00');

INSERT INTO user_chat_histories
(room_id, sender_id, content, created_at)
VALUES
(2, 701, 'world', '2020-01-01 00:00:00');

INSERT INTO user_alarm_histories 
(user_id, alarmed_id, alarm_type, created_at)
VALUES
(2, 701, 'world', '2020-01-01 00:00:00');

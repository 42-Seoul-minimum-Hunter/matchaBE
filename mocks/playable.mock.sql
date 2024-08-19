INSERT INTO users 
(email, username, password, last_name, first_name,
gender, preference, biography, age, connected_at,
updated_at, created_at, deleted_at)
VALUES 
('koryum30@gmail.com', 'User1', '$2b$10$3LC7x6nhLRIdXXSgbZt3kupNF3skLsIwo/5zGnzfIrl59o8AI8jJi', 'min', 'yeomin', 'Male', 'Female',
'hello, world!', '22', '2020-01-01 00:00:00', '2020-01-01 00:00:00', '2020-01-01 00:00:00', NULL);

INSERT INTO auth
(id, user_id, is_oauth, is_valid, is_gps_allowed, is_twofa, updated_at)
VALUES
(701, 701, false, true, true, false, '2020-01-01 00:00:00');

INSERT INTO user_hashtags
(user_id, hashtags, updated_at)
VALUES
(701, ARRAY['RUNNING', 'BUSINESS'], '2020-01-01 00:00:00');

insert into user_profile_images (user_id, profile_images, updated_at) values (701, ARRAY['aHR0cDovL2R1bW15aW1hZ2UuY29tLzIwNngxMDAucG5nL2ZmNDQ0NC9mZmZmZmY=','aHR0cDovL2R1bW15aW1hZ2UuY29tLzIwNngxMDAucG5nL2ZmNDQ0NC9mZmZmZmY=','aHR0cDovL2R1bW15aW1hZ2UuY29tLzIwNngxMDAucG5nL2ZmNDQ0NC9mZmZmZmY=','aHR0cDovL2R1bW15aW1hZ2UuY29tLzIwNngxMDAucG5nL2ZmNDQ0NC9mZmZmZmY=','aHR0cDovL2R1bW15aW1hZ2UuY29tLzIwNngxMDAucG5nL2ZmNDQ0NC9mZmZmZmY='], '11/1/2023');

INSERT INTO user_regions
(user_id, si, gu, updated_at)
VALUES
(701, '서울', '강남구', '2020-01-01 00:00:00');

INSERT INTO users 
(email, username, password, last_name, first_name,
gender, preference, biography, age,connected_at,
updated_at, created_at, deleted_at)
VALUES 
('miyu@student.42seoul.kr', 'User2', '$2b$10$PowjissJN/5aREwXvWsPNORHWWOBIwN1vwOAhn55uBhKXc/rPWyPu', 'min', 'yeomin', 'Female', 'Male',
'hello, world!', '22', '2020-01-01 00:00:00', '2020-01-01 00:00:00', '2020-01-01 00:00:00', NULL);

INSERT INTO auth
(
id, user_id, is_oauth, is_valid, is_gps_allowed, is_twofa, updated_at
)
VALUES
(702, 702, false, true, true, false, '2020-01-01 00:00:00');

INSERT INTO user_hashtags
(user_id, hashtags, updated_at)
VALUES
(702, ARRAY['RUNNING', 'BUSINESS'], '2020-01-01 00:00:00');

insert into user_profile_images (user_id, profile_images, updated_at) values (702, ARRAY['aHR0cDovL2R1bW15aW1hZ2UuY29tLzE5MHgxMDAucG5nLzVmYTJkZC9mZmZmZmY=','aHR0cDovL2R1bW15aW1hZ2UuY29tLzE5MHgxMDAucG5nLzVmYTJkZC9mZmZmZmY=','aHR0cDovL2R1bW15aW1hZ2UuY29tLzE5MHgxMDAucG5nLzVmYTJkZC9mZmZmZmY=','aHR0cDovL2R1bW15aW1hZ2UuY29tLzE5MHgxMDAucG5nLzVmYTJkZC9mZmZmZmY=','aHR0cDovL2R1bW15aW1hZ2UuY29tLzE5MHgxMDAucG5nLzVmYTJkZC9mZmZmZmY='], '9/12/2023');

INSERT INTO user_regions
(user_id, si, gu, updated_at)
VALUES
(702, '서울', '강남구', '2020-01-01 00:00:00');

INSERT INTO users 
(email, username, password, last_name, first_name,
gender, preference, biography, age, connected_at,
updated_at, created_at, deleted_at)
VALUES 
('yeomin@student.42seoul.kr', 'User3', '$2b$10$oLMOmKkhPnb9WZW8jRlp0.VsPcfYD9VKLRA7HqKyE7WKUZh3p7WLm', 'min', 'yeomin', 'Male', 'Female',
'hello, world!', '22', '2020-01-01 00:00:00', '2020-01-01 00:00:00', '2020-01-01 00:00:00', NULL);

INSERT INTO auth
(
id, user_id, is_oauth, is_valid, is_gps_allowed, is_twofa, updated_at
)
VALUES
(703, 703, false, true, true, true, '2020-01-01 00:00:00');

INSERT INTO user_hashtags
(user_id, hashtags, updated_at)
VALUES
(703, ARRAY['RUNNING', 'BUSINESS'], '2020-01-01 00:00:00');

insert into user_profile_images (user_id, profile_images, updated_at) values (703, ARRAY['aHR0cDovL2R1bW15aW1hZ2UuY29tLzI0OXgxMDAucG5nL2RkZGRkZC8wMDAwMDA=','aHR0cDovL2R1bW15aW1hZ2UuY29tLzI0OXgxMDAucG5nL2RkZGRkZC8wMDAwMDA=','aHR0cDovL2R1bW15aW1hZ2UuY29tLzI0OXgxMDAucG5nL2RkZGRkZC8wMDAwMDA=','aHR0cDovL2R1bW15aW1hZ2UuY29tLzI0OXgxMDAucG5nL2RkZGRkZC8wMDAwMDA=','aHR0cDovL2R1bW15aW1hZ2UuY29tLzI0OXgxMDAucG5nL2RkZGRkZC8wMDAwMDA='], '4/26/2024');
INSERT INTO user_regions
(user_id, si, gu, updated_at)
VALUES
(703, '서울', '강남구', '2020-01-01 00:00:00');

--INSERT INTO users 
--(email, username, password, last_name, first_name,
--gender, preference, biography, age, connected_at,
--updated_at, created_at, deleted_at)
--VALUES 
--('oooo0413@naver.com', 'User4', '$2b$10$sTg.yQXe26KMBfMCeWkyTupMgTFIwCAn7TfdCyLjMTqgyBUeWttAO', 'min', 'yeomin', 'Male', 'Female',
--'hello, world!', '22', '2020-01-01 00:00:00', '2020-01-01 00:00:00', '2020-01-01 00:00:00', NULL);

--INSERT INTO auth
--(
--id, user_id, is_oauth, is_valid, is_gps_allowed, is_twofa, updated_at
--)
--VALUES
--(704, 704, false, true, true, true, '2020-01-01 00:00:00');

--INSERT INTO user_hashtags
--(user_id, hashtags, updated_at)
--VALUES
--(704, ARRAY['RUNNING', 'BUSINESS'], '2020-01-01 00:00:00');

--insert into user_profile_images (user_id, profile_images, updated_at) values (704, ARRAY['aHR0cDovL2R1bW15aW1hZ2UuY29tLzIzMHgxMDAucG5nLzVmYTJkZC9mZmZmZmY=','aHR0cDovL2R1bW15aW1hZ2UuY29tLzIzMHgxMDAucG5nLzVmYTJkZC9mZmZmZmY=','aHR0cDovL2R1bW15aW1hZ2UuY29tLzIzMHgxMDAucG5nLzVmYTJkZC9mZmZmZmY=','aHR0cDovL2R1bW15aW1hZ2UuY29tLzIzMHgxMDAucG5nLzVmYTJkZC9mZmZmZmY=','aHR0cDovL2R1bW15aW1hZ2UuY29tLzIzMHgxMDAucG5nLzVmYTJkZC9mZmZmZmY='], '8/28/2023');

--INSERT INTO user_regions
--(user_id, si, gu, updated_at)
--VALUES
--(704, '서울', '강남구', '2020-01-01 00:00:00');

INSERT INTO user_ratings
(user_id, rated_id, rate_score, rated_at)
VALUES
(699, 701, 3, '2020-01-01 00:00:00');

INSERT INTO user_ratings
(user_id, rated_id, rate_score, rated_at)
VALUES
(699, 702,  4, '2020-01-01 00:00:00');

INSERT INTO user_ratings
(user_id, rated_id, rate_score, rated_at)
VALUES
(696, 701, 3, '2020-01-01 00:00:00');

INSERT INTO user_ratings
(user_id, rated_id, rate_score, rated_at)
VALUES
(696, 702, 4, '2020-01-01 00:00:00');

INSERT INTO user_ratings
(user_id, rated_id, rate_score, rated_at)
VALUES
(701, 699, 3, '2020-01-01 00:00:00');


INSERT INTO user_like_histories
(user_id, liked_id, created_at)
VALUES
(701, 702, '2020-01-01 00:00:00');

INSERT INTO user_like_histories
(user_id, liked_id, created_at)
VALUES
(702, 701, '2020-01-01 00:00:00');

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

--INSERT INTO user_chat_histories
--(room_id, sender_id, content, created_at)
--VALUES
--(2, 701, 'world', '2020-01-01 00:00:00');

--INSERT INTO user_alarm_histories 
--(user_id, alarmed_id, alarm_type, created_at)
--VALUES
--(2, 701, 'world', '2020-01-01 00:00:00');

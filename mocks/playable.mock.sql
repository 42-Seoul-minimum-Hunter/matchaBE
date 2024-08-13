INSERT INTO users 
(email, username, password, last_name, first_name,
gender, preference, biography, age, connected_at,
updated_at, created_at, deleted_at)
VALUES 
('koryum30@gmail.com', 'User1', 'Password1!', 'min', 'yeomin', 'Male', 'Female',
'hello, world!', '22', '2020-01-01 00:00:00', '2020-01-01 00:00:00', '2020-01-01 00:00:00', NULL);

INSERT INTO auth
(id, user_id, is_oauth, is_valid, is_gps_allowed, is_twofa, updated_at)
VALUES
(701, 701, false, true, true, false, '2020-01-01 00:00:00');

INSERT INTO user_hashtags
(user_id, hashtags, updated_at)
VALUES
(701, ARRAY['RUNNING', 'BUSINESS'], '2020-01-01 00:00:00');

INSERT INTO user_profile_images
(user_id, profile_images, updated_at)
VALUES
(701, ARRAY['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAISSURBVDjLfZM9a1RBFIaf2d27H1kLTRUQEtAUojYpxA/yA1JYCKmtxE60XSxSxCb/wCJiY2NpK1GwCIEgpBBCQK1CihVMcM3m7p2ZM+dY3E3YuKsDw5kZ5nnn5Zwzzsw4HenpE+P6TWRjAxPBUkJjRIcxW1rCPnyi/fG9O2VqjIxRyEZAFSn3IliIo8hfAlEwEdR7VKQUEjlb1yYIVM4JhIh5D3NzJO9R70nek4oCNz+P5gMshP84CHHVHe6tNG71ad2tQ606PHdIXhA+75JCXP2nQP3+/gFS6ccbDy/4+iwpVTApcJKTDfZpVt723b10MMq40yrYmzu3wb0LC89nfGig+S+kOMFigUkAV6XRdEx9fdkl2oPs2e72+Rwk6ci1RzNeWqS8RwolaDGgRY70fpIf9Shml2f0OHXGkmgqi7F9BR0cl6AEkIhGj0lA4wD5fchApsCnxfEcqE2rVbFYoBKwFFEp4RSGIr4geUGTm55QRiubSOKZ9bOZhlECljymE/rA1I5c7IOm89bFl3mIHlAQD5GjcQcpbtZ6e7hahqZwznr5cqKStWj6H0hgc9zBQNdqO6+7mcupZE1QxVL5JzCj2mrTaGfUvmx1TStrY30AEF7MP0ZYDQvLM0X9MkkU8znEnPrJPrWdra6KW7m4/m19ogBA0bl6W/vSIeqimpsmgZk7UmFT69napVfft0fv/wFUf661fqqpcgAAAABJRU5ErkJggg==', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAISSURBVDjLfZM9a1RBFIaf2d27H1kLTRUQEtAUojYpxA/yA1JYCKmtxE60XSxSxCb/wCJiY2NpK1GwCIEgpBBCQK1CihVMcM3m7p2ZM+dY3E3YuKsDw5kZ5nnn5Zwzzsw4HenpE+P6TWRjAxPBUkJjRIcxW1rCPnyi/fG9O2VqjIxRyEZAFSn3IliIo8hfAlEwEdR7VKQUEjlb1yYIVM4JhIh5D3NzJO9R70nek4oCNz+P5gMshP84CHHVHe6tNG71ad2tQ606PHdIXhA+75JCXP2nQP3+/gFS6ccbDy/4+iwpVTApcJKTDfZpVt723b10MMq40yrYmzu3wb0LC89nfGig+S+kOMFigUkAV6XRdEx9fdkl2oPs2e72+Rwk6ci1RzNeWqS8RwolaDGgRY70fpIf9Shml2f0OHXGkmgqi7F9BR0cl6AEkIhGj0lA4wD5fchApsCnxfEcqE2rVbFYoBKwFFEp4RSGIr4geUGTm55QRiubSOKZ9bOZhlECljymE/rA1I5c7IOm89bFl3mIHlAQD5GjcQcpbtZ6e7hahqZwznr5cqKStWj6H0hgc9zBQNdqO6+7mcupZE1QxVL5JzCj2mrTaGfUvmx1TStrY30AEF7MP0ZYDQvLM0X9MkkU8znEnPrJPrWdra6KW7m4/m19ogBA0bl6W/vSIeqimpsmgZk7UmFT69napVfft0fv/wFUf661fqqpcgAAAABJRU5ErkJggg==', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAISSURBVDjLfZM9a1RBFIaf2d27H1kLTRUQEtAUojYpxA/yA1JYCKmtxE60XSxSxCb/wCJiY2NpK1GwCIEgpBBCQK1CihVMcM3m7p2ZM+dY3E3YuKsDw5kZ5nnn5Zwzzsw4HenpE+P6TWRjAxPBUkJjRIcxW1rCPnyi/fG9O2VqjIxRyEZAFSn3IliIo8hfAlEwEdR7VKQUEjlb1yYIVM4JhIh5D3NzJO9R70nek4oCNz+P5gMshP84CHHVHe6tNG71ad2tQ606PHdIXhA+75JCXP2nQP3+/gFS6ccbDy/4+iwpVTApcJKTDfZpVt723b10MMq40yrYmzu3wb0LC89nfGig+S+kOMFigUkAV6XRdEx9fdkl2oPs2e72+Rwk6ci1RzNeWqS8RwolaDGgRY70fpIf9Shml2f0OHXGkmgqi7F9BR0cl6AEkIhGj0lA4wD5fchApsCnxfEcqE2rVbFYoBKwFFEp4RSGIr4geUGTm55QRiubSOKZ9bOZhlECljymE/rA1I5c7IOm89bFl3mIHlAQD5GjcQcpbtZ6e7hahqZwznr5cqKStWj6H0hgc9zBQNdqO6+7mcupZE1QxVL5JzCj2mrTaGfUvmx1TStrY30AEF7MP0ZYDQvLM0X9MkkU8znEnPrJPrWdra6KW7m4/m19ogBA0bl6W/vSIeqimpsmgZk7UmFT69napVfft0fv/wFUf661fqqpcgAAAABJRU5ErkJggg=='], '2020-01-01 00:00:00');

INSERT INTO user_regions
(user_id, si, gu, updated_at)
VALUES
(701, '서울', '강남구', '2020-01-01 00:00:00');

INSERT INTO users 
(email, username, password, last_name, first_name,
gender, preference, biography, age,connected_at,
updated_at, created_at, deleted_at)
VALUES 
('miyu@student.42seoul.kr', 'User2', 'Password1!', 'min', 'yeomin', 'Female', 'Male',
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

INSERT INTO user_profile_images
(user_id, profile_images, updated_at)
VALUES
(702, ARRAY['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAISSURBVDjLfZM9a1RBFIaf2d27H1kLTRUQEtAUojYpxA/yA1JYCKmtxE60XSxSxCb/wCJiY2NpK1GwCIEgpBBCQK1CihVMcM3m7p2ZM+dY3E3YuKsDw5kZ5nnn5Zwzzsw4HenpE+P6TWRjAxPBUkJjRIcxW1rCPnyi/fG9O2VqjIxRyEZAFSn3IliIo8hfAlEwEdR7VKQUEjlb1yYIVM4JhIh5D3NzJO9R70nek4oCNz+P5gMshP84CHHVHe6tNG71ad2tQ606PHdIXhA+75JCXP2nQP3+/gFS6ccbDy/4+iwpVTApcJKTDfZpVt723b10MMq40yrYmzu3wb0LC89nfGig+S+kOMFigUkAV6XRdEx9fdkl2oPs2e72+Rwk6ci1RzNeWqS8RwolaDGgRY70fpIf9Shml2f0OHXGkmgqi7F9BR0cl6AEkIhGj0lA4wD5fchApsCnxfEcqE2rVbFYoBKwFFEp4RSGIr4geUGTm55QRiubSOKZ9bOZhlECljymE/rA1I5c7IOm89bFl3mIHlAQD5GjcQcpbtZ6e7hahqZwznr5cqKStWj6H0hgc9zBQNdqO6+7mcupZE1QxVL5JzCj2mrTaGfUvmx1TStrY30AEF7MP0ZYDQvLM0X9MkkU8znEnPrJPrWdra6KW7m4/m19ogBA0bl6W/vSIeqimpsmgZk7UmFT69napVfft0fv/wFUf661fqqpcgAAAABJRU5ErkJggg==', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAISSURBVDjLfZM9a1RBFIaf2d27H1kLTRUQEtAUojYpxA/yA1JYCKmtxE60XSxSxCb/wCJiY2NpK1GwCIEgpBBCQK1CihVMcM3m7p2ZM+dY3E3YuKsDw5kZ5nnn5Zwzzsw4HenpE+P6TWRjAxPBUkJjRIcxW1rCPnyi/fG9O2VqjIxRyEZAFSn3IliIo8hfAlEwEdR7VKQUEjlb1yYIVM4JhIh5D3NzJO9R70nek4oCNz+P5gMshP84CHHVHe6tNG71ad2tQ606PHdIXhA+75JCXP2nQP3+/gFS6ccbDy/4+iwpVTApcJKTDfZpVt723b10MMq40yrYmzu3wb0LC89nfGig+S+kOMFigUkAV6XRdEx9fdkl2oPs2e72+Rwk6ci1RzNeWqS8RwolaDGgRY70fpIf9Shml2f0OHXGkmgqi7F9BR0cl6AEkIhGj0lA4wD5fchApsCnxfEcqE2rVbFYoBKwFFEp4RSGIr4geUGTm55QRiubSOKZ9bOZhlECljymE/rA1I5c7IOm89bFl3mIHlAQD5GjcQcpbtZ6e7hahqZwznr5cqKStWj6H0hgc9zBQNdqO6+7mcupZE1QxVL5JzCj2mrTaGfUvmx1TStrY30AEF7MP0ZYDQvLM0X9MkkU8znEnPrJPrWdra6KW7m4/m19ogBA0bl6W/vSIeqimpsmgZk7UmFT69napVfft0fv/wFUf661fqqpcgAAAABJRU5ErkJggg==', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAISSURBVDjLfZM9a1RBFIaf2d27H1kLTRUQEtAUojYpxA/yA1JYCKmtxE60XSxSxCb/wCJiY2NpK1GwCIEgpBBCQK1CihVMcM3m7p2ZM+dY3E3YuKsDw5kZ5nnn5Zwzzsw4HenpE+P6TWRjAxPBUkJjRIcxW1rCPnyi/fG9O2VqjIxRyEZAFSn3IliIo8hfAlEwEdR7VKQUEjlb1yYIVM4JhIh5D3NzJO9R70nek4oCNz+P5gMshP84CHHVHe6tNG71ad2tQ606PHdIXhA+75JCXP2nQP3+/gFS6ccbDy/4+iwpVTApcJKTDfZpVt723b10MMq40yrYmzu3wb0LC89nfGig+S+kOMFigUkAV6XRdEx9fdkl2oPs2e72+Rwk6ci1RzNeWqS8RwolaDGgRY70fpIf9Shml2f0OHXGkmgqi7F9BR0cl6AEkIhGj0lA4wD5fchApsCnxfEcqE2rVbFYoBKwFFEp4RSGIr4geUGTm55QRiubSOKZ9bOZhlECljymE/rA1I5c7IOm89bFl3mIHlAQD5GjcQcpbtZ6e7hahqZwznr5cqKStWj6H0hgc9zBQNdqO6+7mcupZE1QxVL5JzCj2mrTaGfUvmx1TStrY30AEF7MP0ZYDQvLM0X9MkkU8znEnPrJPrWdra6KW7m4/m19ogBA0bl6W/vSIeqimpsmgZk7UmFT69napVfft0fv/wFUf661fqqpcgAAAABJRU5ErkJggg=='], '2020-01-01 00:00:00');

INSERT INTO user_regions
(user_id, si, gu, updated_at)
VALUES
(702, '서울', '강남구', '2020-01-01 00:00:00');

INSERT INTO users 
(email, username, password, last_name, first_name,
gender, preference, biography, age, connected_at,
updated_at, created_at, deleted_at)
VALUES 
('yeomin@student.42seoul.kr', 'User3', 'Password1!', 'min', 'yeomin', 'Male', 'Female',
'hello, world!', '22', '2020-01-01 00:00:00', '2020-01-01 00:00:00', '2020-01-01 00:00:00', NULL);

INSERT INTO auth
(
id, user_id, is_oauth, is_valid, is_gps_allowed, is_twofa, updated_at
)
VALUES
(703, 703, false, true, true, false, '2020-01-01 00:00:00');

INSERT INTO user_hashtags
(user_id, hashtags, updated_at)
VALUES
(703, ARRAY['RUNNING', 'BUSINESS'], '2020-01-01 00:00:00');

INSERT INTO user_profile_images
(user_id, profile_images, updated_at)
VALUES
(703, ARRAY['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAISSURBVDjLfZM9a1RBFIaf2d27H1kLTRUQEtAUojYpxA/yA1JYCKmtxE60XSxSxCb/wCJiY2NpK1GwCIEgpBBCQK1CihVMcM3m7p2ZM+dY3E3YuKsDw5kZ5nnn5Zwzzsw4HenpE+P6TWRjAxPBUkJjRIcxW1rCPnyi/fG9O2VqjIxRyEZAFSn3IliIo8hfAlEwEdR7VKQUEjlb1yYIVM4JhIh5D3NzJO9R70nek4oCNz+P5gMshP84CHHVHe6tNG71ad2tQ606PHdIXhA+75JCXP2nQP3+/gFS6ccbDy/4+iwpVTApcJKTDfZpVt723b10MMq40yrYmzu3wb0LC89nfGig+S+kOMFigUkAV6XRdEx9fdkl2oPs2e72+Rwk6ci1RzNeWqS8RwolaDGgRY70fpIf9Shml2f0OHXGkmgqi7F9BR0cl6AEkIhGj0lA4wD5fchApsCnxfEcqE2rVbFYoBKwFFEp4RSGIr4geUGTm55QRiubSOKZ9bOZhlECljymE/rA1I5c7IOm89bFl3mIHlAQD5GjcQcpbtZ6e7hahqZwznr5cqKStWj6H0hgc9zBQNdqO6+7mcupZE1QxVL5JzCj2mrTaGfUvmx1TStrY30AEF7MP0ZYDQvLM0X9MkkU8znEnPrJPrWdra6KW7m4/m19ogBA0bl6W/vSIeqimpsmgZk7UmFT69napVfft0fv/wFUf661fqqpcgAAAABJRU5ErkJggg==', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAISSURBVDjLfZM9a1RBFIaf2d27H1kLTRUQEtAUojYpxA/yA1JYCKmtxE60XSxSxCb/wCJiY2NpK1GwCIEgpBBCQK1CihVMcM3m7p2ZM+dY3E3YuKsDw5kZ5nnn5Zwzzsw4HenpE+P6TWRjAxPBUkJjRIcxW1rCPnyi/fG9O2VqjIxRyEZAFSn3IliIo8hfAlEwEdR7VKQUEjlb1yYIVM4JhIh5D3NzJO9R70nek4oCNz+P5gMshP84CHHVHe6tNG71ad2tQ606PHdIXhA+75JCXP2nQP3+/gFS6ccbDy/4+iwpVTApcJKTDfZpVt723b10MMq40yrYmzu3wb0LC89nfGig+S+kOMFigUkAV6XRdEx9fdkl2oPs2e72+Rwk6ci1RzNeWqS8RwolaDGgRY70fpIf9Shml2f0OHXGkmgqi7F9BR0cl6AEkIhGj0lA4wD5fchApsCnxfEcqE2rVbFYoBKwFFEp4RSGIr4geUGTm55QRiubSOKZ9bOZhlECljymE/rA1I5c7IOm89bFl3mIHlAQD5GjcQcpbtZ6e7hahqZwznr5cqKStWj6H0hgc9zBQNdqO6+7mcupZE1QxVL5JzCj2mrTaGfUvmx1TStrY30AEF7MP0ZYDQvLM0X9MkkU8znEnPrJPrWdra6KW7m4/m19ogBA0bl6W/vSIeqimpsmgZk7UmFT69napVfft0fv/wFUf661fqqpcgAAAABJRU5ErkJggg==', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAISSURBVDjLfZM9a1RBFIaf2d27H1kLTRUQEtAUojYpxA/yA1JYCKmtxE60XSxSxCb/wCJiY2NpK1GwCIEgpBBCQK1CihVMcM3m7p2ZM+dY3E3YuKsDw5kZ5nnn5Zwzzsw4HenpE+P6TWRjAxPBUkJjRIcxW1rCPnyi/fG9O2VqjIxRyEZAFSn3IliIo8hfAlEwEdR7VKQUEjlb1yYIVM4JhIh5D3NzJO9R70nek4oCNz+P5gMshP84CHHVHe6tNG71ad2tQ606PHdIXhA+75JCXP2nQP3+/gFS6ccbDy/4+iwpVTApcJKTDfZpVt723b10MMq40yrYmzu3wb0LC89nfGig+S+kOMFigUkAV6XRdEx9fdkl2oPs2e72+Rwk6ci1RzNeWqS8RwolaDGgRY70fpIf9Shml2f0OHXGkmgqi7F9BR0cl6AEkIhGj0lA4wD5fchApsCnxfEcqE2rVbFYoBKwFFEp4RSGIr4geUGTm55QRiubSOKZ9bOZhlECljymE/rA1I5c7IOm89bFl3mIHlAQD5GjcQcpbtZ6e7hahqZwznr5cqKStWj6H0hgc9zBQNdqO6+7mcupZE1QxVL5JzCj2mrTaGfUvmx1TStrY30AEF7MP0ZYDQvLM0X9MkkU8znEnPrJPrWdra6KW7m4/m19ogBA0bl6W/vSIeqimpsmgZk7UmFT69napVfft0fv/wFUf661fqqpcgAAAABJRU5ErkJggg=='], '2020-01-01 00:00:00');

INSERT INTO user_regions
(user_id, si, gu, updated_at)
VALUES
(703, '서울', '강남구', '2020-01-01 00:00:00');

--INSERT INTO users 
--(email, username, password, last_name, first_name,
--gender, preference, biography, age, connected_at,
--updated_at, created_at, deleted_at)
--VALUES 
--('oooo0413@naver.com', 'User4', 'Password1!', 'min', 'yeomin', 'Male', 'Female',
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

--INSERT INTO user_profile_images
--(user_id, profile_images, updated_at)
--VALUES
--(704, ARRAY['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAISSURBVDjLfZM9a1RBFIaf2d27H1kLTRUQEtAUojYpxA/yA1JYCKmtxE60XSxSxCb/wCJiY2NpK1GwCIEgpBBCQK1CihVMcM3m7p2ZM+dY3E3YuKsDw5kZ5nnn5Zwzzsw4HenpE+P6TWRjAxPBUkJjRIcxW1rCPnyi/fG9O2VqjIxRyEZAFSn3IliIo8hfAlEwEdR7VKQUEjlb1yYIVM4JhIh5D3NzJO9R70nek4oCNz+P5gMshP84CHHVHe6tNG71ad2tQ606PHdIXhA+75JCXP2nQP3+/gFS6ccbDy/4+iwpVTApcJKTDfZpVt723b10MMq40yrYmzu3wb0LC89nfGig+S+kOMFigUkAV6XRdEx9fdkl2oPs2e72+Rwk6ci1RzNeWqS8RwolaDGgRY70fpIf9Shml2f0OHXGkmgqi7F9BR0cl6AEkIhGj0lA4wD5fchApsCnxfEcqE2rVbFYoBKwFFEp4RSGIr4geUGTm55QRiubSOKZ9bOZhlECljymE/rA1I5c7IOm89bFl3mIHlAQD5GjcQcpbtZ6e7hahqZwznr5cqKStWj6H0hgc9zBQNdqO6+7mcupZE1QxVL5JzCj2mrTaGfUvmx1TStrY30AEF7MP0ZYDQvLM0X9MkkU8znEnPrJPrWdra6KW7m4/m19ogBA0bl6W/vSIeqimpsmgZk7UmFT69napVfft0fv/wFUf661fqqpcgAAAABJRU5ErkJggg==', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAISSURBVDjLfZM9a1RBFIaf2d27H1kLTRUQEtAUojYpxA/yA1JYCKmtxE60XSxSxCb/wCJiY2NpK1GwCIEgpBBCQK1CihVMcM3m7p2ZM+dY3E3YuKsDw5kZ5nnn5Zwzzsw4HenpE+P6TWRjAxPBUkJjRIcxW1rCPnyi/fG9O2VqjIxRyEZAFSn3IliIo8hfAlEwEdR7VKQUEjlb1yYIVM4JhIh5D3NzJO9R70nek4oCNz+P5gMshP84CHHVHe6tNG71ad2tQ606PHdIXhA+75JCXP2nQP3+/gFS6ccbDy/4+iwpVTApcJKTDfZpVt723b10MMq40yrYmzu3wb0LC89nfGig+S+kOMFigUkAV6XRdEx9fdkl2oPs2e72+Rwk6ci1RzNeWqS8RwolaDGgRY70fpIf9Shml2f0OHXGkmgqi7F9BR0cl6AEkIhGj0lA4wD5fchApsCnxfEcqE2rVbFYoBKwFFEp4RSGIr4geUGTm55QRiubSOKZ9bOZhlECljymE/rA1I5c7IOm89bFl3mIHlAQD5GjcQcpbtZ6e7hahqZwznr5cqKStWj6H0hgc9zBQNdqO6+7mcupZE1QxVL5JzCj2mrTaGfUvmx1TStrY30AEF7MP0ZYDQvLM0X9MkkU8znEnPrJPrWdra6KW7m4/m19ogBA0bl6W/vSIeqimpsmgZk7UmFT69napVfft0fv/wFUf661fqqpcgAAAABJRU5ErkJggg==', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAISSURBVDjLfZM9a1RBFIaf2d27H1kLTRUQEtAUojYpxA/yA1JYCKmtxE60XSxSxCb/wCJiY2NpK1GwCIEgpBBCQK1CihVMcM3m7p2ZM+dY3E3YuKsDw5kZ5nnn5Zwzzsw4HenpE+P6TWRjAxPBUkJjRIcxW1rCPnyi/fG9O2VqjIxRyEZAFSn3IliIo8hfAlEwEdR7VKQUEjlb1yYIVM4JhIh5D3NzJO9R70nek4oCNz+P5gMshP84CHHVHe6tNG71ad2tQ606PHdIXhA+75JCXP2nQP3+/gFS6ccbDy/4+iwpVTApcJKTDfZpVt723b10MMq40yrYmzu3wb0LC89nfGig+S+kOMFigUkAV6XRdEx9fdkl2oPs2e72+Rwk6ci1RzNeWqS8RwolaDGgRY70fpIf9Shml2f0OHXGkmgqi7F9BR0cl6AEkIhGj0lA4wD5fchApsCnxfEcqE2rVbFYoBKwFFEp4RSGIr4geUGTm55QRiubSOKZ9bOZhlECljymE/rA1I5c7IOm89bFl3mIHlAQD5GjcQcpbtZ6e7hahqZwznr5cqKStWj6H0hgc9zBQNdqO6+7mcupZE1QxVL5JzCj2mrTaGfUvmx1TStrY30AEF7MP0ZYDQvLM0X9MkkU8znEnPrJPrWdra6KW7m4/m19ogBA0bl6W/vSIeqimpsmgZk7UmFT69napVfft0fv/wFUf661fqqpcgAAAABJRU5ErkJggg=='], '2020-01-01 00:00:00');

--INSERT INTO user_regions
--(user_id, si, gu, updated_at)
--VALUES
--(704, '서울', '강남구', '2020-01-01 00:00:00');

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

INSERT INTO user_chat_histories
(room_id, sender_id, content, created_at)
VALUES
(1, 702, 'hello', '2020-01-01 00:00:00');

--INSERT INTO user_chat_histories
--(room_id, sender_id, content, created_at)
--VALUES
--(2, 701, 'world', '2020-01-01 00:00:00');

--INSERT INTO user_alarm_histories 
--(user_id, alarmed_id, alarm_type, created_at)
--VALUES
--(2, 701, 'world', '2020-01-01 00:00:00');

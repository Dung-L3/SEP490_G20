-- SQL Scripts để kiểm tra và cập nhật table status

-- 1. Kiểm tra status hiện tại
SELECT TableID, TableName, Status FROM RestaurantTable;

-- 2. Cập nhật một số bàn thành Occupied để test
UPDATE RestaurantTable SET Status = 'Occupied' WHERE TableID IN (1, 3, 5);

-- 3. Đảm bảo một số bàn là Available
UPDATE RestaurantTable SET Status = 'Available' WHERE TableID IN (2, 4, 6);

-- 4. Kiểm tra lại sau khi update
SELECT TableID, TableName, Status FROM RestaurantTable;
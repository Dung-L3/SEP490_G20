// Danh sách bàn dùng chung cho TableManager và Waiter
export interface TableInfo {
  id: number;
  name: string;
  status: string;
  capacity: number;
  estimatedTime?: string;
}

const tables: TableInfo[] = [
  { id: 1, name: 'Bàn 1', status: 'Trống', capacity: 4 },
  { id: 2, name: 'Bàn 2', status: 'Đã đặt', capacity: 2, estimatedTime: '19:30' },
  { id: 3, name: 'Bàn 3', status: 'Trống', capacity: 6 },
  { id: 4, name: 'Bàn 4', status: 'Đang phục vụ', capacity: 4, estimatedTime: '45 phút' },
  { id: 5, name: 'Bàn 5', status: 'Trống', capacity: 2 },
  { id: 6, name: 'Bàn 6', status: 'Đã đặt', capacity: 8, estimatedTime: '20:00' },
  { id: 7, name: 'Bàn 7', status: 'Trống', capacity: 4 },
  { id: 8, name: 'Bàn 8', status: 'Trống', capacity: 2 },
  { id: 9, name: 'Bàn 9', status: 'Trống', capacity: 6 },
  { id: 10, name: 'Bàn 10', status: 'Bảo trì', capacity: 4 },
  { id: 11, name: 'Bàn 11', status: 'Trống', capacity: 2 },
  { id: 12, name: 'Bàn 12', status: 'Đã đặt', capacity: 4, estimatedTime: '19:45' },
  { id: 13, name: 'Bàn 13', status: 'Trống', capacity: 6 },
  { id: 14, name: 'Bàn 14', status: 'Đang phục vụ', capacity: 2, estimatedTime: '30 phút' },
  { id: 15, name: 'Bàn 15', status: 'Trống', capacity: 4 },
  { id: 16, name: 'Bàn 16', status: 'Trống', capacity: 8 },
  { id: 17, name: 'Bàn 17', status: 'Đã đặt', capacity: 2, estimatedTime: '20:15' },
  { id: 18, name: 'Bàn 18', status: 'Trống', capacity: 4 },
  { id: 19, name: 'Bàn 19', status: 'Trống', capacity: 6 },
  { id: 20, name: 'Bàn 20', status: 'Bảo trì', capacity: 4 },
  { id: 21, name: 'Bàn 21', status: 'Trống', capacity: 4 },
  { id: 22, name: 'Bàn 22', status: 'Đang phục vụ', capacity: 6, estimatedTime: '20 phút' },
  { id: 23, name: 'Bàn 23', status: 'Trống', capacity: 2 },
  { id: 24, name: 'Bàn 24', status: 'Đã đặt', capacity: 4, estimatedTime: '21:00' },
  { id: 25, name: 'Bàn 25', status: 'Trống', capacity: 8 },
  { id: 26, name: 'Bàn 26', status: 'Trống', capacity: 2 },
  { id: 27, name: 'Bàn 27', status: 'Đã đặt', capacity: 4, estimatedTime: '19:30' },
  { id: 28, name: 'Bàn 28', status: 'Đang phục vụ', capacity: 6, estimatedTime: '35 phút' }
];

export default tables;

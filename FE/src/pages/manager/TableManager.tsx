import React, { useState, useEffect } from 'react';
import TableMap from '../../components/TableMap';
import TaskbarManager from '../../components/TaskbarManager';

interface Order {
  orderId: number;
  status: string;
  // add more fields if needed
}

interface Table {
  tableId: number;
  tableName: string;
  areaId: number;
  tableType: string;
  status: string;
  isWindow: boolean;
  notes: string;
  createdAt: string;
  orders: Order[];
}

const sampleTables: Table[] = [
  {
    tableId: 1,
    tableName: 'Bàn 1',
    areaId: 1,
    tableType: '4 người',
    status: 'Trống',
    isWindow: false,
    notes: '',
    createdAt: new Date().toISOString(),
    orders: [],
  },
  {
    tableId: 2,
    tableName: 'Bàn 2',
    areaId: 1,
    tableType: '4 người',
    status: 'Đã đặt',
    isWindow: false,
    notes: 'Khách đến lúc 19:30',
    createdAt: new Date().toISOString(),
    orders: [],
  },
  // ...thêm dữ liệu mẫu khác nếu cần
];

const TableManager: React.FC = () => {
  const [tables, setTables] = useState<Table[]>(sampleTables);
  const [filteredTables, setFilteredTables] = useState<Table[]>(sampleTables);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newTable, setNewTable] = useState<Table>({
    tableId: 0,
    tableName: '',
    areaId: 1,
    tableType: '4 người',
    status: 'Trống',
    isWindow: false,
    notes: '',
    createdAt: new Date().toISOString(),
    orders: [],
  });
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  useEffect(() => {
    const filtered = tables.filter((table) =>
      table.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.tableType.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTables(filtered);
  }, [searchQuery, tables]);

  const handleTableClick = (table: Table) => {
    alert(`Bàn: ${table.tableName}\nLoại: ${table.tableType}\nTrạng thái: ${table.status}\nVị trí cửa sổ: ${table.isWindow ? 'Có' : 'Không'}\nGhi chú: ${table.notes}`);
  };

  const handleCreateTable = () => {
    const newId = tables.length > 0 ? Math.max(...tables.map(t => t.tableId)) + 1 : 1;
    setTables([...tables, { ...newTable, tableId: newId }]);
    setShowCreateModal(false);
    setNewTable({
      tableId: 0,
      tableName: '',
      areaId: 1,
      tableType: '4 người',
      status: 'Trống',
      isWindow: false,
      notes: '',
      createdAt: new Date().toISOString(),
      orders: [],
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-56 sticky top-0 h-screen">
        <TaskbarManager />
      </div>
      <div className="flex-1">
        <div className="p-4 bg-white shadow-sm flex justify-between items-center">
          <input
            type="text"
            placeholder="Tìm kiếm bàn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-1/3 px-4 py-2 border rounded-lg focus:outline-none"
          />
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Thêm bàn mới
          </button>
        </div>
        <TableMap tables={filteredTables} onTableClick={handleTableClick} />
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Thêm bàn mới</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tên bàn</label>
                  <input
                    type="text"
                    value={newTable.tableName}
                    onChange={(e) => setNewTable({ ...newTable, tableName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Loại bàn</label>
                  <select
                    value={newTable.tableType}
                    onChange={(e) => setNewTable({ ...newTable, tableType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  >
                    <option>2 người</option>
                    <option>4 người</option>
                    <option>6 người</option>
                    <option>8 người</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={newTable.status}
                    onChange={(e) => setNewTable({ ...newTable, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  >
                    <option>Trống</option>
                    <option>Đã đặt</option>
                    <option>Đang phục vụ</option>
                    <option>Bảo trì</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newTable.isWindow}
                    onChange={(e) => setNewTable({ ...newTable, isWindow: e.target.checked })}
                    className="mr-2"
                  />
                  <label>Gần cửa sổ</label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ghi chú</label>
                  <textarea
                    value={newTable.notes}
                    onChange={(e) => setNewTable({ ...newTable, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div className="pt-4 border-t">
                  <button onClick={handleCreateTable}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Tạo bàn mới
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableManager;

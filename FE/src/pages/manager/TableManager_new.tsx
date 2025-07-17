import React, { useState, useEffect } from 'react';
import TableMap from '../../components/TableMap';
import TaskbarManager from '../../components/TaskbarManager';

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

interface Order {
  orderId: number;
  status: string;
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
    orders: []
  },
  {
    tableId: 2,
    tableName: 'Bàn 2',
    areaId: 1,
    tableType: '2 người',
    status: 'Đã đặt',
    isWindow: true,
    notes: 'Đã đặt lúc 19:30',
    createdAt: new Date().toISOString(),
    orders: []
  }
];

const TableManager: React.FC = () => {
  const [tables, setTables] = useState<Table[]>(sampleTables);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTables, setFilteredTables] = useState<Table[]>(sampleTables);
  const [newTable, setNewTable] = useState<Table>({
    tableId: 0,
    tableName: '',
    areaId: 1,
    tableType: '2 người',
    status: 'Trống',
    isWindow: false,
    notes: '',
    createdAt: new Date().toISOString(),
    orders: []
  });

  // Tìm kiếm bàn
  useEffect(() => {
    const filtered = tables.filter(table => 
      table.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.tableType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.notes.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTables(filtered);
  }, [searchQuery, tables]);

  const handleTableClick = (table: Table) => {
    alert(
      `Bàn: ${table.tableName}\nLoại: ${table.tableType}\nTrạng thái: ${table.status}\nKhu vực: ${table.areaId}\nVị trí cửa sổ: ${table.isWindow ? 'Có' : 'Không'}\nGhi chú: ${table.notes}`
    );
  };

  const handleCreateTable = () => {
    const newId = Math.max(...tables.map(t => t.tableId)) + 1;
    const tableToAdd = {
      ...newTable,
      tableId: newId,
      createdAt: new Date().toISOString()
    };
    setTables([...tables, tableToAdd]);
    setShowCreateModal(false);
    setNewTable({
      tableId: 0,
      tableName: '',
      areaId: 1,
      tableType: '2 người',
      status: 'Trống',
      isWindow: false,
      notes: '',
      createdAt: new Date().toISOString(),
      orders: []
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Taskbar cố định trái */}
      <div style={{ width: 220, minHeight: '100vh', position: 'sticky', top: 0, zIndex: 10 }}>
        <TaskbarManager />
      </div>
      
      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Thanh công cụ */}
        <div className="p-4 bg-white shadow-sm">
          <div className="flex justify-between items-center">
            <div className="relative w-96">
              <input
                type="text"
                placeholder="Tìm kiếm bàn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Thêm bàn mới
            </button>
          </div>
        </div>

        {/* Sơ đồ bàn */}
        <div className="p-6">
          <TableMap tables={filteredTables} onTableClick={handleTableClick} />
        </div>

        {/* Modal tạo bàn mới */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">Thêm bàn mới</h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tên bàn
                  </label>
                  <input
                    type="text"
                    value={newTable.tableName}
                    onChange={(e) => setNewTable({...newTable, tableName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tên bàn..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Loại bàn
                  </label>
                  <select
                    value={newTable.tableType}
                    onChange={(e) => setNewTable({...newTable, tableType: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="2 người">2 người</option>
                    <option value="4 người">4 người</option>
                    <option value="6 người">6 người</option>
                    <option value="8 người">8 người</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Khu vực
                  </label>
                  <select
                    value={newTable.areaId}
                    onChange={(e) => setNewTable({...newTable, areaId: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>Tầng 1</option>
                    <option value={2}>Tầng 2</option>
                    <option value={3}>Tầng 3</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isWindow"
                    checked={newTable.isWindow}
                    onChange={(e) => setNewTable({...newTable, isWindow: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isWindow" className="text-sm font-medium text-slate-700">
                    Vị trí cửa sổ
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    value={newTable.notes}
                    onChange={(e) => setNewTable({...newTable, notes: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Nhập ghi chú (nếu có)..."
                  />
                </div>

                <div className="pt-4 border-t">
                  <button
                    onClick={handleCreateTable}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
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

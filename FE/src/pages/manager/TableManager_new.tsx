import React, { useState, useEffect } from 'react';
import type { FC } from 'react';
import TaskbarManager from '../../components/TaskbarManager';
import { tableApi } from '../../api/tableApi';
import { type UiTable, mapApiTableToUiTable, mapUiTableToApiTable } from '../../utils/tableMapping';

const TableManager: FC = () => {
  const [tables, setTables] = React.useState<UiTable[]>([]);
  const [filteredTables, setFilteredTables] = React.useState<UiTable[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<UiTable | null>(null);
  const [statusDropdownId, setStatusDropdownId] = useState<number | null>(null);
  const [newTable, setNewTable] = useState({
    tableId: 0,
    tableName: '',
    areaId: 1,
    tableType: '4 người',
    status: 'Trống',
    isWindow: false,
    notes: '',
    createdAt: new Date().toISOString(),
    orders: []
  });

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setIsLoading(true);
        const response = await tableApi.getAll();
        const uiTables = response.map(mapApiTableToUiTable);
        setTables(uiTables);
        setFilteredTables(uiTables);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tables');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTables();
  }, []);

  useEffect(() => {
    const filtered = tables.filter((table) =>
      table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTables(filtered);
  }, [searchQuery, tables]);

  const handleTableClick = (table: UiTable) => {
    setSelectedTable(table);
    setShowEditModal(true);
  };

  const handleUpdateTable = async (table: UiTable) => {
    try {
      setIsLoading(true);
      const apiTable = mapUiTableToApiTable(table);
      const updatedTable = await tableApi.update(table.id, {
        ...apiTable,
        tableId: table.id,
      });
      const uiTable = mapApiTableToUiTable(updatedTable);
      setTables(tables.map(t => t.id === uiTable.id ? uiTable : t));
      setShowEditModal(false);
      setSelectedTable(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update table');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTable = async (table: UiTable) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bàn ${table.name}?`)) {
      try {
        setIsLoading(true);
        await tableApi.delete(table.id, '');
        setTables(tables.filter(t => t.id !== table.id));
        setShowEditModal(false);
        setSelectedTable(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete table');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCreateTable = async () => {
    try {
      setIsLoading(true);
      const tableToCreate = {
        tableName: newTable.tableName.trim(),
        areaId: newTable.areaId || 1,
        tableType: newTable.tableType || '4 người',
        status: 'Trống',
        isWindow: newTable.isWindow || false,
        notes: newTable.notes.trim(),
        createdAt: new Date().toISOString(),
        orders: []
      };

      await tableApi.create(tableToCreate);
      const response = await tableApi.getAll();
      const uiTables = response.map(mapApiTableToUiTable);
      setTables(uiTables);
      setFilteredTables(uiTables);
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
        orders: []
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create table');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (table: UiTable) => {
    try {
      setIsLoading(true);
      const newStatus = table.status === 'Trống' ? 'Đang phục vụ' : 'Trống';
      const apiTable = mapUiTableToApiTable({...table, status: newStatus});
      const updatedTable = await tableApi.update(table.id, {
        ...apiTable,
        tableId: table.id,
      });
      const uiTable = mapApiTableToUiTable(updatedTable);
      setTables(tables.map(t => t.id === uiTable.id ? uiTable : t));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update table status');
    } finally {
      setIsLoading(false);
    }
  };

  // Mảng các trạng thái có thể có
  const availableStatuses = ['Trống', 'Đang phục vụ', 'Đã đặt trước'];

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownId !== null) {
        const dropdown = document.querySelector(`[data-dropdown-id="${statusDropdownId}"]`);
        if (dropdown && !dropdown.contains(event.target as Node)) {
          setStatusDropdownId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [statusDropdownId]);

  if (isLoading) {
    return <div className="flex items-center justify-center p-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TaskbarManager />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Quản lý bàn</h1>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm bàn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Thêm bàn mới
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTables.map((table) => (
              <div 
                key={table.id} 
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{table.name}</h3>
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-600">Khu vực {table.areaId}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="text-gray-600">{table.type}</span>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatusDropdownId(statusDropdownId === table.id ? null : table.id);
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 transition-all duration-200 ${
                          table.status === 'Trống' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : table.status === 'Đang phục vụ'
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        }`}
                      >
                        <span>{table.status}</span>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {statusDropdownId === table.id && (
                        <div 
                          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-200"
                        >
                          {availableStatuses.map(status => (
                            <button
                              key={status}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange({...table, status});
                                setStatusDropdownId(null);
                              }}
                              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                                table.status === status ? 'font-medium bg-gray-50' : ''
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {table.isWindow && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <svg className="mr-1.5 h-2 w-2 text-blue-400" fill="currentColor" viewBox="0 0 8 8">
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                        View cửa sổ
                      </span>
                    )}
                    {table.notes && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <svg className="mr-1.5 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Có ghi chú
                      </span>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <button
                      onClick={() => handleTableClick(table)}
                      className="inline-flex items-center px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteTable(table)}
                      className="inline-flex items-center px-3 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m4-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal tạo bàn mới */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Thêm bàn mới</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full p-1"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên bàn</label>
                  <input
                    type="text"
                    value={newTable.tableName}
                    onChange={(e) => setNewTable({...newTable, tableName: e.target.value})}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập tên bàn..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực</label>
                  <input
                    type="number"
                    value={newTable.areaId}
                    onChange={(e) => setNewTable({...newTable, areaId: parseInt(e.target.value)})}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập số khu vực..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại bàn</label>
                  <select
                    value={newTable.tableType}
                    onChange={(e) => setNewTable({...newTable, tableType: e.target.value})}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="2 người">2 người</option>
                    <option value="4 người">4 người</option>
                    <option value="6 người">6 người</option>
                    <option value="8 người">8 người</option>
                  </select>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="createWindow"
                    checked={newTable.isWindow}
                    onChange={(e) => setNewTable({...newTable, isWindow: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="createWindow" className="text-sm font-medium text-gray-700">
                    View cửa sổ
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    value={newTable.notes}
                    onChange={(e) => setNewTable({...newTable, notes: e.target.value})}
                    rows={3}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Thêm ghi chú..."
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateTable}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Tạo bàn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa bàn */}
      {showEditModal && selectedTable && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Chỉnh sửa bàn {selectedTable.name}
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full p-1"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên bàn</label>
                  <input
                    type="text"
                    value={selectedTable.name}
                    onChange={(e) => setSelectedTable({...selectedTable, name: e.target.value})}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực</label>
                  <input
                    type="number"
                    value={selectedTable.areaId}
                    onChange={(e) => setSelectedTable({...selectedTable, areaId: parseInt(e.target.value)})}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại bàn</label>
                  <select
                    value={selectedTable.type}
                    onChange={(e) => setSelectedTable({...selectedTable, type: e.target.value})}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="2 người">2 người</option>
                    <option value="4 người">4 người</option>
                    <option value="6 người">6 người</option>
                    <option value="8 người">8 người</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select
                    value={selectedTable.status}
                    onChange={(e) => setSelectedTable({...selectedTable, status: e.target.value})}
                    className={`block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      selectedTable.status === 'Trống'
                        ? 'bg-green-50 border-green-300 text-green-800'
                        : selectedTable.status === 'Đang phục vụ'
                        ? 'bg-red-50 border-red-300 text-red-800'
                        : 'bg-yellow-50 border-yellow-300 text-yellow-800'
                    }`}
                  >
                    {availableStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="editWindow"
                    checked={selectedTable.isWindow}
                    onChange={(e) => setSelectedTable({...selectedTable, isWindow: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="editWindow" className="text-sm font-medium text-gray-700">
                    View cửa sổ
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    value={selectedTable.notes}
                    onChange={(e) => setSelectedTable({...selectedTable, notes: e.target.value})}
                    rows={3}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between">
              <button
                onClick={() => selectedTable && handleDeleteTable(selectedTable)}
                className="inline-flex items-center px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m4-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Xóa bàn
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Hủy
                </button>
                <button
                  onClick={() => selectedTable && handleUpdateTable(selectedTable)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManager;
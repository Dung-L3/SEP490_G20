import React, { useState, useEffect } from 'react';
import { X, Plus, RefreshCw } from 'lucide-react';
import { tableApi } from '../api/tableApi';
import type { Table } from '../types/Table';

interface MergeTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMergeSuccess: () => void;
}

const MergeTableModal: React.FC<MergeTableModalProps> = ({ isOpen, onClose, onMergeSuccess }) => {
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAvailableTables();
    } else {
      // Reset selected tables khi modal đóng
      setSelectedTables([]);
      setError('');
    }
  }, [isOpen]);

  // Keyboard support
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !merging) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, merging, onClose]);

  const fetchAvailableTables = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching available tables...');
      const tables = await tableApi.getAvailableTablesForMerge();
      console.log('Available tables from API:', tables);
      console.log('Number of available tables:', tables.length);
      setAvailableTables(tables);
    } catch (error) {
      console.error('Error fetching available tables:', error);
      setError('Không thể tải danh sách bàn trống. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = (tableId: number) => {
    setSelectedTables(prev => {
      if (prev.includes(tableId)) {
        return prev.filter(id => id !== tableId);
      } else {
        // Limit maximum tables to 6
        if (prev.length >= 6) {
          setError('Không thể ghép quá 6 bàn cùng lúc');
          return prev;
        }
        setError(''); // Clear error when selecting valid number
        return [...prev, tableId];
      }
    });
  };

  const handleMerge = async () => {
    if (selectedTables.length < 2) {
      setError('Vui lòng chọn ít nhất 2 bàn để ghép');
      return;
    }

    if (selectedTables.length > 6) {
      setError('Không thể ghép quá 6 bàn cùng lúc');
      return;
    }

    try {
      setMerging(true);
      setError('');
      
      console.log('Starting merge process...');
      console.log('Selected tables:', selectedTables);
      console.log('Available tables data:', availableTables);
      
      // Debug: Check status of selected tables
      selectedTables.forEach(id => {
        const table = availableTables.find(t => t.tableId === id);
        console.log(`Table ${id}: Status = "${table?.status}", Name = "${table?.tableName}"`);
      });
      
      // Validate selected tables still exist and available
      const validTables = selectedTables.filter(id => 
        availableTables.some(table => table.tableId === id)
      );
      
      console.log('Valid tables after filter:', validTables);
      
      if (validTables.length !== selectedTables.length) {
        setError('Một số bàn đã được chọn bởi người khác. Vui lòng thử lại.');
        return;
      }
      
      // Get current user ID from localStorage or context (fallback to 1)
      const currentUserId = parseInt(localStorage.getItem('userId') || '1');
      console.log('Current user ID:', currentUserId);
      
      console.log('Calling merge API...');
      const result = await tableApi.mergeTable(validTables, currentUserId, 'Bàn ghép từ waiter');
      console.log('Merge successful:', result);
      
      // Show success message
      alert('Ghép bàn thành công!');
      
      onMergeSuccess();
      onClose();
      setSelectedTables([]);
    } catch (error: any) {
      console.error('Error merging tables:', error);
      let errorMessage = 'Không thể ghép bàn';
      
      // Parse error from backend
      if (error.message) {
        console.log('Error message:', error.message);
        
        // Check if it's a backend error with specific message
        if (error.message.includes('status: 500')) {
          try {
            // Extract the actual error message from backend
            const match = error.message.match(/"trace":"[^"]*?IllegalArgumentException: ([^\\r\\n]*)/);
            if (match && match[1]) {
              errorMessage = match[1];
            } else if (error.message.includes('không trống')) {
              errorMessage = 'Một số bàn đã được sử dụng. Vui lòng kiểm tra lại trạng thái bàn.';
            }
          } catch (parseError) {
            console.log('Could not parse backend error');
          }
        } else if (error.message.includes('không tồn tại')) {
          errorMessage = 'Không tìm thấy bàn được chọn.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      
      // Refresh available tables to get latest status
      fetchAvailableTables();
    } finally {
      setMerging(false);
    }
  };

  const getSelectedTableNames = () => {
    return selectedTables
      .map(id => availableTables.find(table => table.tableId === id)?.tableName)
      .filter(Boolean)
      .join(' + ');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <Plus className="w-6 h-6 mr-2" />
                Ghép bàn
              </h2>
              <p className="text-blue-100 mt-1">Chọn các bàn trống để ghép lại</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Available Tables */}
              <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center justify-between">
                <span>
                  Bàn có thể ghép: 
                  <span className="text-blue-600 ml-2">({availableTables.length} bàn)</span>
                </span>
                <button
                  onClick={fetchAvailableTables}
                  disabled={loading}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Làm mới danh sách"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </h3>
                {availableTables.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-2">Không có bàn nào để ghép</p>
                    <p className="text-sm text-gray-400">
                      Tất cả bàn đã được ghép hoặc bàn đã đặt trước
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {availableTables.map(table => (
                      <div
                        key={table.tableId}
                        onClick={() => handleTableSelect(table.tableId)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedTables.includes(table.tableId)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-semibold">{table.tableName}</div>
                          <div className="text-sm text-gray-500">{table.tableType}</div>
                          <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                            table.status === 'Available' || table.status === 'Trống' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {table.status === 'Available' || table.status === 'Trống' ? 'Trống' : 'Đang phục vụ'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Tables Preview */}
              {selectedTables.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Bàn đã chọn:</h4>
                  <p className="text-blue-700">
                    <span className="font-medium">Tên bàn sau khi ghép:</span> {getSelectedTableNames()}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Đã chọn {selectedTables.length} bàn
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={merging}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            onClick={handleMerge}
            disabled={selectedTables.length < 2 || selectedTables.length > 6 || merging || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {merging ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang ghép...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Ghép bàn
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MergeTableModal;
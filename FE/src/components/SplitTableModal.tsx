import React, { useState } from 'react';
import { X, Unlink } from 'lucide-react';
import { tableApi } from '../api/tableApi';

interface MergedTable {
  groupId: number;
  mergedName: string;
  tableNames: string[];
  tableIds: number[];
  status: string;
  createdBy: number;
  createdAt: string;
  notes: string;
}

interface SplitTableModalProps {
  isOpen: boolean;
  mergedTable: MergedTable | null;
  onClose: () => void;
  onSplitSuccess: () => void;
}

const SplitTableModal: React.FC<SplitTableModalProps> = ({ 
  isOpen, 
  mergedTable, 
  onClose, 
  onSplitSuccess 
}) => {
  const [splitting, setSplitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !mergedTable) return null;

  const handleSplit = async () => {
    try {
      setSplitting(true);
      setError('');
      
      console.log('Splitting table group:', mergedTable.groupId);
      
      await tableApi.disbandTableGroup(mergedTable.groupId);
      
      console.log('Table group split successfully');
      onSplitSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error splitting table group:', error);
      setError(error.message || 'Không thể tách bàn');
    } finally {
      setSplitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center">
                <Unlink className="w-5 h-5 mr-2" />
                Tách bàn ghép
              </h2>
              <p className="text-orange-100 text-sm mt-1">Xác nhận tách bàn</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Thông tin bàn ghép:</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-gray-700">
                {mergedTable.mergedName || 'Bàn ghép'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Gồm: {mergedTable.tableNames?.join(', ') || 'Đang tải...'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Số bàn: {mergedTable.tableIds?.length || 0} bàn
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              <strong>Lưu ý:</strong> Sau khi tách bàn, các bàn sẽ trở về trạng thái độc lập và có thể được sử dụng riêng biệt.
            </p>
          </div>

          <p className="text-gray-600 text-center">
            Bạn có chắc chắn muốn tách bàn ghép này không?
          </p>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={splitting}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSplit}
            disabled={splitting}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {splitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang tách...
              </>
            ) : (
              <>
                <Unlink className="w-4 h-4 mr-2" />
                Tách bàn
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplitTableModal;
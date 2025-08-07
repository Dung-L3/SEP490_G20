import React, { useState, useRef } from 'react';
import { mergedTableApi } from '../api/mergedTableApi';
import TableSelector, { type TableSelectorRef } from './TableSelector';

interface TableForOrder {
  id: number;
  name: string;
  status: string;
  type: 'individual' | 'merged';
  groupId?: number;
}

const TableManagement: React.FC = () => {
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [selectedMergedTable, setSelectedMergedTable] = useState<TableForOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const tableSelectorRef = useRef<TableSelectorRef>(null);

  const handleTableSelect = (table: TableForOrder) => {
    if (table.type === 'merged') {
      setSelectedMergedTable(table);
      setSelectedTables([]);
    } else {
      setSelectedMergedTable(null);
      if (selectedTables.includes(table.id)) {
        setSelectedTables(selectedTables.filter(id => id !== table.id));
      } else {
        setSelectedTables([...selectedTables, table.id]);
      }
    }
  };

  const handleMergeTables = async () => {
    if (selectedTables.length < 2) {
      alert('Vui lòng chọn ít nhất 2 bàn để ghép');
      return;
    }

    try {
      setLoading(true);
      await mergedTableApi.mergeTables(selectedTables, 1, 'Merge tables operation');
      alert('Ghép bàn thành công!');
      setSelectedTables([]);
      
      // Refresh table list
      if (tableSelectorRef.current) {
        tableSelectorRef.current.refresh();
      }
    } catch (error) {
      console.error('Error merging tables:', error);
      alert('Có lỗi xảy ra khi ghép bàn');
    } finally {
      setLoading(false);
    }
  };

  const handleDisbandTable = async () => {
    if (!selectedMergedTable || !selectedMergedTable.groupId) {
      alert('Vui lòng chọn một bàn ghép để tách');
      return;
    }

    try {
      setLoading(true);
      await mergedTableApi.disbandTableGroup(selectedMergedTable.groupId);
      alert('Tách bàn thành công!');
      setSelectedMergedTable(null);
      
      // Refresh table list to show individual tables
      if (tableSelectorRef.current) {
        tableSelectorRef.current.refresh();
      }
    } catch (error) {
      console.error('Error disbanding table:', error);
      alert('Có lỗi xảy ra khi tách bàn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Quản lý bàn</h2>
        
        <div className="flex gap-4 mb-4">
          <button
            onClick={handleMergeTables}
            disabled={selectedTables.length < 2 || loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            {loading ? 'Đang ghép...' : `Ghép bàn (${selectedTables.length})`}
          </button>
          
          <button
            onClick={handleDisbandTable}
            disabled={!selectedMergedTable || loading}
            className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-red-600 transition-colors"
          >
            {loading ? 'Đang tách...' : 'Tách bàn ghép'}
          </button>
        </div>

        {selectedTables.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Đã chọn {selectedTables.length} bàn để ghép: {selectedTables.join(', ')}
            </p>
          </div>
        )}

        {selectedMergedTable && (
          <div className="mb-4 p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-800">
              Đã chọn bàn ghép: {selectedMergedTable.name}
            </p>
          </div>
        )}
      </div>

      <TableSelector
        ref={tableSelectorRef}
        onTableSelect={handleTableSelect}
        selectedTableId={selectedMergedTable?.id}
        selectedTableIds={selectedTables}
      />
    </div>
  );
};

export default TableManagement;
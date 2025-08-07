import { useEffect, useState } from 'react';
import { tableApi } from '../../api/tableApi';
import { type UiTable, mapApiTableToUiTableFixed } from '../../utils/tableMapping';
import TaskbarWaiter from './TaskbarWaiter';
import WaiterTableMap from './WaiterTableMap';
import SplitTableModal from '../../components/SplitTableModal';

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

const TableView = () => {
  const [tables, setTables] = useState<UiTable[]>([]);
  const [allTables, setAllTables] = useState<UiTable[]>([]); // Store all tables for name mapping
  const [mergedTables, setMergedTables] = useState<MergedTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [selectedMergedTable, setSelectedMergedTable] = useState<MergedTable | null>(null);

  useEffect(() => {
    fetchAllTables();
  }, []);

  const fetchAllTables = async () => {
    try {
      setLoading(true);
      
            console.log('Fetching all tables...');
      
      // Fetch both individual tables and merged tables
      const [individualTablesData, mergedTablesData] = await Promise.all([
        tableApi.getAll(),
        tableApi.getAllMergedTables()
      ]);
      
      console.log('Individual tables from API:', individualTablesData);
      console.log('Merged tables from API:', mergedTablesData);
      
      // Debug table status từ API
      individualTablesData.forEach((table, index) => {
        console.log(`API Table ${index}:`, {
          tableId: table.tableId,
          tableName: table.tableName, 
          status: table.status,
          fullObject: table
        });
      });
      
      // Debug merged tables structure
      mergedTablesData.forEach((merged, index) => {
        console.log(`Merged table ${index}:`, {
          groupId: merged.groupId,
          mergedName: merged.mergedName,
          tableNames: merged.tableNames,
          tableIds: merged.tableIds,
          fullObject: merged
        });
      });
      
      // Log merged table IDs for debugging
      const mergedTableIds = mergedTablesData.flatMap((merged: MergedTable) => merged.tableIds);
      console.log('All merged table IDs:', mergedTableIds);
      
      // Convert individual tables
      const uiTables = individualTablesData.map(mapApiTableToUiTableFixed);
      console.log('UI tables after mapping:', uiTables);
      
      // Filter out tables that are part of merged groups
      const filteredTables = uiTables.filter(table => !mergedTableIds.includes(table.id));
      
      console.log('Filtered tables (excluding merged):', filteredTables);
      console.log('Final merged tables:', mergedTablesData);
      
      // Set filtered tables for display, but pass all tables to WaiterTableMap for name mapping
      setTables(filteredTables);
      setAllTables(uiTables); // Store all tables for name mapping
      setMergedTables(mergedTablesData);
      setError(null);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setError('Không thể tải danh sách bàn');
    } finally {
      setLoading(false);
    }
  };

  const handleMergeSuccess = () => {
    // Refresh data sau khi ghép bàn thành công
    fetchAllTables();
  };

  const handleMergedTableClick = (mergedTable: MergedTable) => {
    setSelectedMergedTable(mergedTable);
    setShowSplitModal(true);
  };

  const handleSplitSuccess = () => {
    // Refresh data sau khi tách bàn thành công
    fetchAllTables();
    setShowSplitModal(false);
    setSelectedMergedTable(null);
  };

  const handleTableClick = async (table: UiTable) => {
    if (updating) return; // Ngăn chặn nhiều lần cập nhật đồng thời
    
    // Chỉ cho phép click vào bàn trống
    if (table.status !== 'Available' && table.status !== 'Trống') {
      console.log(`Table ${table.name} is not available. Status: ${table.status}`);
      return;
    }
    
    try {
      setUpdating(table.id);
      
      // Chuyển từ trạng thái Available/Trống sang Occupied
      const newBackendStatus = 'Occupied';
      
      console.log(`Updating table ${table.id} from ${table.status} to ${newBackendStatus}`);
      
      await tableApi.updateStatus(table.id, newBackendStatus);
      
      // Cập nhật trạng thái local với display status
      setTables(prevTables => 
        prevTables.map(t => 
          t.id === table.id ? { ...t, status: newBackendStatus } : t
        )
      );
      
      console.log(`Table ${table.id} updated successfully`);
      
    } catch (error) {
      console.error('Error updating table status:', error);
      setError('Không thể cập nhật trạng thái bàn');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-xl">Đang tải dữ liệu bàn...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Taskbar trái */}
      <TaskbarWaiter onMergeSuccess={handleMergeSuccess} />
      <div className="hidden md:block w-56" />
      
      {/* Nội dung chính */}
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Sơ đồ bàn</h1>
          <p className="text-gray-600">Quản lý trạng thái các bàn trong nhà hàng</p>
          {mergedTables.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 font-medium">
                Có {mergedTables.length} bàn đã được ghép
              </p>
            </div>
          )}
        </div>

        {/* Sơ đồ bàn */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <WaiterTableMap 
            tables={tables} 
            mergedTables={mergedTables}
            onTableClick={handleTableClick}
            onMergedTableClick={handleMergedTableClick}
            allTables={allTables}
          />
        </div>
      </main>

      {/* Split Table Modal */}
      <SplitTableModal
        isOpen={showSplitModal}
        mergedTable={selectedMergedTable}
        onClose={() => setShowSplitModal(false)}
        onSplitSuccess={handleSplitSuccess}
      />
    </div>
  );
};

export default TableView;

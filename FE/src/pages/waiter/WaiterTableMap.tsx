import React from 'react';
import { Users, CheckCircle, Plus } from 'lucide-react';
import { type UiTable } from '../../utils/tableMapping';

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

interface WaiterTableMapProps {
  tables: UiTable[];
  mergedTables?: MergedTable[];
  onTableClick?: (table: UiTable) => void;
  onMergedTableClick?: (mergedTable: MergedTable) => void;
  allTables?: UiTable[]; // All tables for name mapping
}

const statusConfig: { [key: string]: { color: string; text: string; icon: any; bgGradient: string } } = {
  'Trống': { 
    color: '#22c55e', 
    text: 'Trống',
    icon: CheckCircle,
    bgGradient: 'from-green-50 to-green-100'
  },
  'Available': { 
    color: '#22c55e', 
    text: 'Trống',
    icon: CheckCircle,
    bgGradient: 'from-green-50 to-green-100'
  },
  'Đang phục vụ': { 
    color: '#2563eb', 
    text: 'Đang phục vụ',
    icon: Users,
    bgGradient: 'from-blue-50 to-blue-100'
  },
  'Occupied': { 
    color: '#2563eb', 
    text: 'Đang phục vụ',
    icon: Users,
    bgGradient: 'from-blue-50 to-blue-100'
  },
  'Reserved': { 
    color: '#f59e0b', 
    text: 'Đã đặt',
    icon: Users,
    bgGradient: 'from-yellow-50 to-yellow-100'
  }
};

const WaiterTableMap: React.FC<WaiterTableMapProps> = ({ tables = [], mergedTables = [], onTableClick, onMergedTableClick, allTables }) => {
  // Sắp xếp bàn theo id để hiển thị theo thứ tự - với safe check
  const sortedTables = Array.isArray(tables) ? [...tables].sort((a, b) => a.id - b.id) : [];
  const safeMergedTables = Array.isArray(mergedTables) ? mergedTables : [];

  // Create a map of table ID to table name for easy lookup - use allTables if available
  const tablesToMap = allTables && allTables.length > 0 ? allTables : sortedTables;
  const tableIdToNameMap = tablesToMap.reduce((map, table) => {
    map[table.id] = table.name;
    return map;
  }, {} as Record<number, string>);

  console.log('Table ID to Name mapping:', tableIdToNameMap);
  console.log('Available tables for mapping:', tablesToMap.map(t => ({ id: t.id, name: t.name })));

  return (
    <div className="space-y-6">
      {/* Merged Tables Section */}
      {safeMergedTables.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Bàn đã ghép</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {safeMergedTables.map(mergedTable => {
              // Debug log for each merged table
              console.log('Rendering merged table:', mergedTable);
              
              // Get table names with fallback - prioritize backend data, then map from frontend
              let tableNames: string[] = [];
              if (mergedTable.tableNames && mergedTable.tableNames.length > 0) {
                tableNames = mergedTable.tableNames;
              } else if (mergedTable.tableIds && mergedTable.tableIds.length > 0) {
                // Map table IDs to names using the lookup map
                tableNames = mergedTable.tableIds.map(id => 
                  tableIdToNameMap[id] || `Bàn ${id}`
                );
              }
              
              const tableCount = mergedTable.tableIds?.length || mergedTable.tableNames?.length || 0;
              
              return (
                <div
                  key={mergedTable.groupId}
                  onClick={() => onMergedTableClick && onMergedTableClick(mergedTable)}
                  className="relative p-4 rounded-xl shadow-md bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 cursor-pointer hover:from-purple-100 hover:to-purple-200 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-gray-800 text-sm">
                      {mergedTable.mergedName || tableNames.join(' + ') || 'Bàn ghép'}
                    </span>
                    <Plus size={16} className="text-purple-600" />
                  </div>
                  <div className="text-sm font-medium text-purple-700">
                    Bàn ghép ({tableCount} bàn)
                  </div>
                  <div className="text-xs text-purple-600 mt-1">
                    {tableNames.length > 0 ? `Gồm: ${tableNames.join(', ')}` : 'Đang tải...'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Individual Tables Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Bàn đơn lẻ</h3>
        {sortedTables.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Không có bàn nào</p>
        ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {sortedTables.map(table => {
            // Sử dụng status trực tiếp từ API, không override
            let displayStatus = table.status || 'Available';
            
            // Debug log status cho từng bàn
            console.log(`Table ${table.id} (${table.name}): status = "${table.status}", displayStatus = "${displayStatus}"`);
            
            // Map các status từ backend sang frontend display
            const statusMap: { [key: string]: string } = {
              'Available': 'Trống',
              'Occupied': 'Đang phục vụ', 
              'Reserved': 'Đã đặt',
              'Trống': 'Trống',
              'Đang phục vụ': 'Đang phục vụ'
            };
            
            displayStatus = statusMap[displayStatus] || displayStatus;
            
            const config = statusConfig[displayStatus] || statusConfig['Trống'];
            const Icon = config.icon;
            
            return (
              <div
                key={table.id}
                onClick={() => onTableClick?.(table)}
                className={`
                  relative p-4 rounded-xl shadow-md cursor-pointer
                  transform hover:scale-105 transition-all duration-200
                  bg-gradient-to-br ${config.bgGradient}
                  border-2 border-opacity-50
                `}
                style={{ borderColor: config.color }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-gray-800">{table.name}</span>
                  <Icon size={20} color={config.color} />
                </div>
                <div className="text-sm font-medium" style={{ color: config.color }}>
                  {config.text}
                </div>
                {table.type && (
                  <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                    {table.type === 'VIP' ? '✨ VIP' : table.type}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
};

export default WaiterTableMap;

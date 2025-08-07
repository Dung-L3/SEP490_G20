import React from 'react';
import { Users, CheckCircle } from 'lucide-react';
import { type UiTable } from '../../utils/tableMapping';

interface WaiterTableMapProps {
  tables: UiTable[];
  onTableClick?: (table: UiTable) => void;
}

const statusConfig = {
  'Trống': { 
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
  }
};

const WaiterTableMap: React.FC<WaiterTableMapProps> = ({ tables, onTableClick }) => {
  // Sắp xếp bàn theo id để hiển thị theo thứ tự
  const sortedTables = [...tables].sort((a, b) => a.id - b.id);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {sortedTables.map(table => {
        // Chỉ cho phép trạng thái Trống hoặc Đang phục vụ
        const displayStatus = table.status === 'Trống' || table.status === 'Đang phục vụ' 
          ? table.status 
          : 'Trống';
        
        const config = statusConfig[displayStatus];
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
  );
};

export default WaiterTableMap;

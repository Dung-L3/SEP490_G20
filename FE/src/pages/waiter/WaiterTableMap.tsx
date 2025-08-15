import React, { useState, useEffect } from 'react';
import { Users, CheckCircle } from 'lucide-react';
import { type UiTable } from '../../utils/tableMapping';
import { areaApi, type Area } from '../../api/areaApi';

interface WaiterTableMapProps {
  tables: UiTable[];
  onTableClick?: (table: UiTable) => void;
}

const statusConfig = {
  'Available': { 
    color: '#22c55e', 
    text: 'Available',
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
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<number | null>(null);
  const [isWindowOnly, setIsWindowOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await areaApi.getAllAreas();
        setAreas(response);
      } catch (err) {
        console.error('Không thể lấy danh sách khu vực:', err);
      }
    };
    fetchAreas();
  }, []);

  // Sắp xếp và lọc bàn
  const filteredTables = [...tables]
    .sort((a, b) => a.id - b.id)
    .filter(table => {
      const matchesArea = selectedArea ? table.areaId === selectedArea : true;
      const matchesWindow = isWindowOnly ? table.isWindow : true;
      const matchesSearch = table.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesArea && matchesWindow && matchesSearch;
    });

  return (
    <div className="space-y-6 p-6">
      {/* Bộ lọc */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bàn..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="min-w-[200px]">
          <select
            value={selectedArea || ''}
            onChange={(e) => setSelectedArea(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Tất cả khu vực</option>
            {areas.map(area => (
              <option key={area.areaId} value={area.areaId}>
                {area.areaName}
              </option>
            ))}
          </select>
        </div>

        <label className="inline-flex items-center min-w-[150px] space-x-2">
          <input
            type="checkbox"
            checked={isWindowOnly}
            onChange={(e) => setIsWindowOnly(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Chỉ hiện bàn cửa sổ</span>
        </label>
      </div>

      {/* Danh sách bàn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredTables.map(table => {
        // Chỉ cho phép trạng thái Available hoặc Đang phục vụ
        const displayStatus = table.status === 'Available' || table.status === 'Đang phục vụ' 
          ? table.status 
          : 'Available';
        
        const config = statusConfig[displayStatus];
        const Icon = config.icon;

        return (
          <div
            key={table.id}
            onClick={() => onTableClick?.(table)}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            {/* Header with status */}
            <div className={`p-4 border-b ${config.bgGradient}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon size={20} color={config.color} />
                  <span className="font-bold text-gray-900">{table.name}</span>
                </div>
                <span 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ backgroundColor: `${config.color}20`, color: config.color }}
                >
                  {config.text}
                </span>
              </div>
            </div>

              {/* Table details */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Loại bàn:</span>
                <span className="font-medium text-gray-900">
                  {table.type === 'VIP' ? '✨ VIP' : table.type || 'Thường'}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Vị trí:</span>
                <span className="font-medium text-gray-900">
                  [{areas.find(area => area.areaId === table.areaId)?.areaName || 'Chưa phân khu'}]
                </span>
              </div>              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Sức chứa:</span>
                <span className="font-medium text-gray-900">
                  {table.capacity || 4} người
                </span>
              </div>

              {table.isWindow && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Đặc điểm:</span>
                  <span className="font-medium text-gray-900">
                    Cửa sổ
                  </span>
                </div>
              )}

              {table.notes && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Ghi chú:</span>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                    {table.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
};

export default WaiterTableMap;

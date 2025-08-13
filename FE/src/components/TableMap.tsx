import React, { useState, useEffect } from 'react';
import { Clock, Users, CheckCircle, AlertCircle, Wrench } from 'lucide-react';

interface Table {
  id: number;
  name: string;
  x: number;
  y: number;
  status: string;
  capacity?: number;
  estimatedTime?: string;
}

interface TableMapProps {
  tables?: Table[];
  onTableClick?: (table: Table) => void;
}

const statusConfig = {
  'Trống': { 
    color: '#22c55e', 
    text: 'Trống',
    icon: CheckCircle,
    bgGradient: 'from-green-50 to-green-100'
  },
  'Đã đặt': { 
    color: '#f59e0b', 
    text: 'Đã đặt',
    icon: Clock,
    bgGradient: 'from-amber-50 to-amber-100'
  },
  'Đang phục vụ': { 
    color: '#2563eb', 
    text: 'Đang phục vụ',
    icon: Users,
    bgGradient: 'from-blue-50 to-blue-100'
  },
  'Bảo trì': { 
    color: '#6b7280', 
    text: 'Bảo trì',
    icon: Wrench,
    bgGradient: 'from-gray-50 to-gray-100'
  }
};

// Table data is now provided via props from the API

const TableMap: React.FC<TableMapProps> = ({ tables = [], onTableClick }) => {
  const tablesPerPage = 20;
  const [currentFloor, setCurrentFloor] = useState(1);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  
  // Calculate total floors
  const totalFloors = Math.ceil(tables.length / tablesPerPage);
  
  // Get tables for current floor
  const startIndex = (currentFloor - 1) * tablesPerPage;
  const endIndex = startIndex + tablesPerPage;
  const currentTables = tables.slice(startIndex, endIndex);
  
  // Calculate statistics
  const stats = tables.reduce((acc: Record<string, number>, table: Table) => {
    acc[table.status] = (acc[table.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Arrange tables in 4 rows x 5 columns
  const rowCount = 4;
  const colCount = 5;
  const tableGrid = Array.from({ length: rowCount }, (_, rowIndex) => 
    Array.from({ length: colCount }, (_, colIndex) => {
      const tableIndex = rowIndex * colCount + colIndex;
      return tableIndex < currentTables.length ? currentTables[tableIndex] : null;
    })
  );

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    if (onTableClick) {
      onTableClick(table);
    }
  };

  const getTableSize = (capacity?: number) => {
    if (!capacity) return { width: '140px', height: '100px' };
    if (capacity <= 2) return { width: '120px', height: '90px' };
    if (capacity <= 4) return { width: '140px', height: '100px' };
    if (capacity <= 6) return { width: '160px', height: '110px' };
    return { width: '180px', height: '120px' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">
          Quản lý bàn - Nhà Hàng Hương Quê
        </h1>
        <p className="text-lg text-slate-600">
          Sơ đồ bàn nhà hàng • {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Statistics Bar */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = stats[status] || 0;
            const IconComponent = config.icon;
            return (
              <div key={status} className={`bg-gradient-to-r ${config.bgGradient} p-4 rounded-xl border border-white/50 shadow-sm`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/60">
                    <IconComponent size={20} style={{ color: config.color }} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-800">{count}</div>
                    <div className="text-sm font-medium text-slate-600">{config.text}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Floor Navigation */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex flex-wrap justify-center items-center gap-4">
            <h2 className="text-2xl font-bold mr-6">
              Tầng {currentFloor}
            </h2>
            
            {Array.from({ length: totalFloors }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentFloor(i + 1)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentFloor === i + 1 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'bg-white/10 text-white/80 hover:bg-white/15'
                }`}
              >
                Tầng {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Table Grid */}
        <div className="p-8 bg-gradient-to-br from-slate-50 to-white min-h-[600px]">
          <div className="flex flex-col gap-8 items-center">
            {tableGrid.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-6 justify-center flex-wrap">
                {row.map((table, colIndex) => {
                  if (!table) {
                    return (
                      <div key={`empty-${rowIndex}-${colIndex}`} style={getTableSize()} />
                    );
                  }

                  const config = statusConfig[table.status as keyof typeof statusConfig] || statusConfig['Trống'];
                  const IconComponent = config.icon;
                  const tableSize = getTableSize(table.capacity);
                  
                  return (
                    <div
                      key={table.id}
                      onClick={() => handleTableClick(table)}
                      className="bg-white rounded-xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group"
                      style={{
                        ...tableSize,
                        boxShadow: `0 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 3px ${config.color}20`
                      }}
                    >
                      {/* Status indicator */}
                      <div 
                        className="absolute top-3 right-3 w-4 h-4 rounded-full shadow-lg border-2 border-white"
                        style={{ backgroundColor: config.color }}
                      />
                      
                      {/* Capacity indicator */}
                      <div className="absolute top-3 left-3 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                        {table.capacity}人
                      </div>
                      
                      {/* Content */}
                      <div className="flex flex-col items-center justify-center h-full p-4">
                        <IconComponent 
                          size={24} 
                          style={{ color: config.color }} 
                          className="mb-2"
                        />
                        
                        <div className="text-center">
                          <div className="text-lg font-bold text-slate-800 mb-1">
                            {table.name}
                          </div>
                          <div 
                            className="text-xs font-semibold uppercase tracking-wider"
                            style={{ color: config.color }}
                          >
                            {config.text}
                          </div>
                          {table.estimatedTime && (
                            <div className="text-xs text-slate-500 mt-1 font-medium">
                              {table.estimatedTime}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Status Legend */}
        <div className="bg-slate-50 p-6 border-t border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">
            Chú thích trạng thái
          </h3>
          <div className="flex justify-center gap-6 flex-wrap">
            {Object.entries(statusConfig).map(([status, config]) => {
              const IconComponent = config.icon;
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: config.color }}
                    />
                    <IconComponent size={16} style={{ color: config.color }} />
                  </div>
                  <span className="text-sm font-medium text-slate-600">
                    {config.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table Details Modal */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">{selectedTable.name}</h3>
              <button 
                onClick={() => setSelectedTable(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: statusConfig[selectedTable.status as keyof typeof statusConfig]?.color }}
                />
                <span className="font-medium">Trạng thái: {statusConfig[selectedTable.status as keyof typeof statusConfig]?.text}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Users size={16} className="text-slate-500" />
                <span>Sức chứa: {selectedTable.capacity} người</span>
              </div>
              
              {selectedTable.estimatedTime && (
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-slate-500" />
                  <span>Thời gian dự kiến: {selectedTable.estimatedTime}</span>
                </div>
              )}
              
              <div className="pt-4 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Đặt bàn
                  </button>
                  <button className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors">
                    Chi tiết
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableMap;
import React, { useState, useEffect } from 'react';
import { tableApi } from '../api/tableApi';
import { getQRBaseURL, getLocalIP, displayLocalIPInfo } from '../utils/networkUtils';
import type { Table } from '../types/Table';

interface QRDisplayProps {
  tableId: number;
  tableName: string;
  baseURL: string;
}

const QRDisplay: React.FC<QRDisplayProps> = ({ tableId, tableName, baseURL }) => {
  const menuUrl = `${baseURL}/menu/${tableId}`;
  
  const generateQRUrl = (text: string) => {
    // Sử dụng Google Charts API để tạo QR code
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = `QR_Ban_${tableName}.png`;
    link.href = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}`;
    link.target = '_blank';
    link.click();
  };

  return (
    <div className="text-center p-4 border border-gray-300 rounded-lg">
      <img 
        src={generateQRUrl(menuUrl)}
        alt={`QR Code for ${tableName}`}
        className="mx-auto mb-2 border border-gray-200 rounded"
      />
      <p className="text-sm font-medium text-gray-700">{tableName}</p>
      <p className="text-xs text-gray-500 mb-2">Quét để xem thực đơn</p>
      <button
        onClick={downloadQR}
        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Tải QR Code
      </button>
      <div className="mt-2 text-xs text-gray-400 break-all">
        {menuUrl}
      </div>
    </div>
  );
};

const QRCodeManager: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [baseURL, setBaseURL] = useState('http://192.168.31.166:5173');
  const [localIP, setLocalIP] = useState('192.168.31.166');

  useEffect(() => {
    // Lấy IP local và hiển thị thông tin
    const initializeNetwork = async () => {
      try {
        const [ip, baseUrl] = await Promise.all([
          getLocalIP(),
          getQRBaseURL()
        ]);
        
        setLocalIP(ip);
        setBaseURL(baseUrl);
        
        // Log thông tin truy cập
        displayLocalIPInfo();
      } catch (error) {
        console.error('Error getting network info:', error);
      }
    };

    initializeNetwork();
  }, []);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        const tablesData = await tableApi.getAll();
        setTables(tablesData);
      } catch (err) {
        console.error('Error fetching tables:', err);
        setError('Không thể tải danh sách bàn');
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  const downloadAllQR = () => {
    tables.forEach((table, index) => {
      setTimeout(() => {
        const menuUrl = `${baseURL}/menu/${table.tableId}`;
        const link = document.createElement('a');
        link.download = `QR_Ban_${table.tableName}.png`;
        link.href = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}`;
        link.target = '_blank';
        link.click();
      }, index * 500); // Delay để tránh spam
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Lỗi</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý QR Code</h1>
              <p className="text-gray-600">Tạo và tải QR code cho từng bàn</p>
            </div>
            <button
              onClick={downloadAllQR}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Tải tất cả QR Code
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-blue-800 font-medium mb-2">🌐 Thông tin truy cập:</h3>
          <div className="text-blue-700 text-sm space-y-1">
            <p><strong>Trên máy tính:</strong> http://localhost:5173</p>
            <p><strong>Trên điện thoại (cùng WiFi):</strong> http://192.168.31.166:5173</p>
            <p><strong>QR Manager:</strong> http://192.168.31.166:5173/qr-manager</p>
            <p><strong>Menu VD (Bàn 1):</strong> http://192.168.31.166:5173/menu/1</p>
            <p className="text-xs text-blue-600 mt-2">
              💡 Điện thoại và máy tính phải cùng mạng WiFi
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="text-yellow-800 font-medium mb-2">📱 Hướng dẫn sử dụng:</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li><strong>Bước 1:</strong> In QR code và dán ở từng bàn</li>
            <li><strong>Bước 2:</strong> Khách hàng quét QR code bằng camera điện thoại</li>
            <li><strong>Bước 3:</strong> Tự động chuyển đến menu của bàn đó</li>
            <li><strong>Bước 4:</strong> Khách hàng chọn món và đặt món trực tiếp</li>
            <li><strong>Bước 5:</strong> Chef nhận order và chế biến</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="text-green-800 font-medium mb-2">🧪 Test chức năng:</h3>
          <div className="text-green-700 text-sm space-y-2">
            <p><strong>Test trên máy tính:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• QR Manager: <code className="bg-white px-2 py-1 rounded">http://localhost:5173/qr-manager</code></li>
              <li>• Menu Bàn 1: <code className="bg-white px-2 py-1 rounded">http://localhost:5173/menu/1</code></li>
              <li>• Test CORS: <code className="bg-white px-2 py-1 rounded">http://localhost:5173/api/test/cors</code></li>
            </ul>
            <p><strong>Test trên điện thoại:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• QR Manager: <code className="bg-white px-2 py-1 rounded">http://192.168.31.166:5173/qr-manager</code></li>
              <li>• Menu Bàn 1: <code className="bg-white px-2 py-1 rounded">http://192.168.31.166:5173/menu/1</code></li>
              <li>• Test CORS: <code className="bg-white px-2 py-1 rounded">http://192.168.31.166:5173/api/test/cors</code></li>
            </ul>
            <p className="text-xs text-green-600 mt-2">
              💡 Nếu test CORS trả về JSON thì CORS đã hoạt động
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables.map((table) => (
            <QRDisplay
              key={table.tableId}
              tableId={table.tableId}
              tableName={table.tableName}
              baseURL={baseURL}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default QRCodeManager;
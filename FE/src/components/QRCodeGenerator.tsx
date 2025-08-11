import React, { useEffect, useRef, useState } from 'react';
import { getQRBaseURL } from '../utils/networkUtils';

interface QRCodeGeneratorProps {
  tableId: number;
  tableName: string;
  size?: number;
  className?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  tableId, 
  tableName, 
  size = 200,
  className = ""
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateQR = () => {
      if (canvasRef.current) {
        try {
          const baseUrl = getQRBaseURL();
          const menuUrl = `${baseUrl}/menu/${tableId}`;
          console.log('Generated QR URL:', menuUrl); // For debugging
          
          // Sử dụng Google Charts API thay vì library QRCode
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(menuUrl)}`;
          
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          img.onload = () => {
            canvas.width = size;
            canvas.height = size;
            ctx?.drawImage(img, 0, 0, size, size);
          };
          
          img.crossOrigin = 'anonymous';
          img.src = qrUrl;
          
        } catch (error) {
          console.error('Error generating QR code:', error);
        }
      }
    };

    generateQR();
  }, [tableId, size]);

  const downloadQR = () => {
    try {
      const baseUrl = getQRBaseURL();
      const menuUrl = `${baseUrl}/menu/${tableId}`;
      
      // Tạo QR code với size lớn hơn để download
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}`;
      
      const link = document.createElement('a');
      link.download = `QR_Ban_${tableName}.png`;
      link.href = qrUrl;
      link.target = '_blank';
      link.click();
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  return (
    <div className={`text-center ${className}`}>
      <canvas 
        ref={canvasRef}
        className="border border-gray-300 rounded-lg shadow-sm"
      />
      <div className="mt-2">
        <p className="text-sm font-medium text-gray-700">{tableName}</p>
        <p className="text-xs text-gray-500">Quét để xem thực đơn</p>
        <button
          onClick={downloadQR}
          className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Tải QR Code
        </button>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
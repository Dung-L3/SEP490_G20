// Network utilities for QR Menu - USING CONFIG FILE
import { NETWORK_CONFIG } from '../config/networkConfig';

// Hàm lấy URL cho QR code
export const getQRBaseURL = (): string => {
  return `http://${NETWORK_CONFIG.LOCAL_IP}:${NETWORK_CONFIG.FRONTEND_PORT}`;
};

// Kiểm tra cấu hình mạng khi khởi động
export const checkNetworkConfig = () => {
  const config = {
    ip: NETWORK_CONFIG.LOCAL_IP,
    frontendPort: NETWORK_CONFIG.FRONTEND_PORT,
    qrUrl: getQRBaseURL()
  };
  
  console.log('Network Configuration:', config);
  return config;
};
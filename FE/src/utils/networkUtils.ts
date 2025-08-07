// Network utilities for QR Menu - UPDATED WITH FIXED IP
export const getLocalIP = async (): Promise<string> => {
  // Trả về IP cố định của máy bạn
  return '192.168.31.166';
};

export const getQRBaseURL = async (): Promise<string> => {
  // Sử dụng IP cố định với port 5173
  return 'http://192.168.31.166:5173';
};

export const displayLocalIPInfo = () => {
  console.log('🌐 Network Info (Fixed IP):');
  console.log('📱 Mobile access: http://192.168.31.166:5173');
  console.log('🖥️  Desktop access: http://localhost:5173');
  console.log('📋 QR Manager: http://192.168.31.166:5173/qr-manager');
};
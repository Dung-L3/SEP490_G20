// 🌐 NETWORK CONFIGURATION
// Thay đổi IP ở đây khi chuyển máy khác
export const NETWORK_CONFIG = {
  // IP của máy tính (thay đổi khi cần)
  LOCAL_IP: '192.168.1.11',
  
  // Port của frontend
  FRONTEND_PORT: 5173,
  
  // Port của backend
  BACKEND_PORT: 8080,
  
  // Tự động tạo URLs
  get FRONTEND_URL() {
    return `http://${this.LOCAL_IP}:${this.FRONTEND_PORT}`;
  },
  
  get BACKEND_URL() {
    return `http://${this.LOCAL_IP}:${this.BACKEND_PORT}`;
  },
  
  get LOCALHOST_URL() {
    return `http://localhost:${this.FRONTEND_PORT}`;
  }
};

// Export các URLs để sử dụng
export const {
  LOCAL_IP,
  FRONTEND_PORT,
  BACKEND_PORT,
  FRONTEND_URL,
  BACKEND_URL,
  LOCALHOST_URL
} = NETWORK_CONFIG;
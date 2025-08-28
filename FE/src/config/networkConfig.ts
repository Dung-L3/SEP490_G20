// 🌐 NETWORK CONFIGURATION
// Chỉ cần thay đổi LOCAL_IP khi chuyển máy khác
export const NETWORK_CONFIG = {
  // IP của máy tính (chỉ cần thay đổi duy nhất giá trị này)
  LOCAL_IP: '192.168.24.103',
  
  // Các cấu hình cố định
  FRONTEND_PORT: 5173,
  BACKEND_PORT: 8080,
  
  // Tự động tạo URLs
  get FRONTEND_URL() {
    // Ưu tiên sử dụng IP cục bộ
    return `http://${this.LOCAL_IP}:${this.FRONTEND_PORT}`;
  },
  
  get BACKEND_URL() {
    // Tự động sử dụng cùng IP với frontend
    return `http://${this.LOCAL_IP}:${this.BACKEND_PORT}`;
  },

  get LOCALHOST_URL() {
    // Hỗ trợ localhost cho development
    return `http://localhost:${this.FRONTEND_PORT}`;
  },

  // Tạo danh sách các origin được phép
  get ALLOWED_ORIGINS() {
    return [
      `http://${this.LOCAL_IP}:${this.FRONTEND_PORT}`,
      `http://localhost:${this.FRONTEND_PORT}`,
      `http://127.0.0.1:${this.FRONTEND_PORT}`
    ];
  }
};

// Export các giá trị cần thiết
export const {
  LOCAL_IP,
  FRONTEND_PORT,
  BACKEND_PORT,
  FRONTEND_URL,
  BACKEND_URL,
  LOCALHOST_URL
} = NETWORK_CONFIG;
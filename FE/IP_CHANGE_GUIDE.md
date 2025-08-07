# 🌐 HƯỚNG DẪN THAY ĐỔI IP CHO QR MENU

## 📋 Khi chuyển sang máy tính khác:

### **Bước 1: Tìm IP của máy mới**
```bash
# Windows
ipconfig
# Tìm IPv4 Address của WiFi adapter

# Ví dụ: 192.168.1.100
```

### **Bước 2: Cập nhật file config**
Mở file: `src/config/networkConfig.ts`

Thay đổi dòng:
```typescript
LOCAL_IP: '192.168.31.166',  // <- Thay IP cũ
```

Thành:
```typescript
LOCAL_IP: '192.168.1.100',   // <- IP mới của máy
```

### **Bước 3: Restart ứng dụng**
```bash
# Stop frontend (Ctrl+C)
npm run dev
```

## ✅ Kết quả:
- QR codes sẽ tự động sử dụng IP mới
- Tất cả URLs sẽ cập nhật theo IP mới
- Không cần sửa code ở các file khác

## 🎯 File cần thay đổi:
- **Chỉ 1 file:** `src/config/networkConfig.ts`
- **1 dòng:** `LOCAL_IP: 'IP_MỚI'`

## 📱 Test sau khi thay đổi:
1. Truy cập: `http://IP_MỚI:5173/qr-manager`
2. Kiểm tra QR codes có URL mới
3. Test bằng điện thoại
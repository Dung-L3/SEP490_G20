// Utility để lấy IP local của máy tính
export const getLocalIP = (): Promise<string> => {
  return new Promise((resolve) => {
    // Nếu đang chạy trên server thật (không phải localhost)
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      resolve(window.location.hostname);
      return;
    }

    // Tạo RTCPeerConnection để lấy IP local
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.createDataChannel('');
    pc.createOffer()
      .then(offer => pc.setLocalDescription(offer))
      .catch(() => resolve('localhost'));

    pc.onicecandidate = (ice) => {
      if (!ice || !ice.candidate || !ice.candidate.candidate) return;
      
      const myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate);
      
      if (myIP && myIP[1]) {
        pc.close();
        resolve(myIP[1]);
      }
    };

    // Timeout fallback
    setTimeout(() => {
      pc.close();
      resolve('localhost');
    }, 1000);
  });
};

// Lấy base URL cho QR code
export const getQRBaseURL = async (): Promise<string> => {
  try {
    const ip = await getLocalIP();
    return `http://${ip}:3000`;
  } catch (error) {
    console.error('Error getting local IP:', error);
    return 'http://localhost:3000';
  }
};

// Hiển thị IP cho user
export const displayLocalIPInfo = () => {
  getLocalIP().then(ip => {
    console.log(`
🌐 Thông tin truy cập:
📱 Trên máy tính: http://localhost:3000
📱 Trên điện thoại (cùng WiFi): http://${ip}:3000
📄 QR Manager: http://${ip}:3000/qr-manager
    `);
  });
};
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { reservationApi } from '../api/reservationApi';

const Booking = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  const validateTime = (timeStr: string): boolean => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const time = hours * 60 + minutes;
    const openTime = 7 * 60 + 30;  // 7:30
    const closeTime = 20 * 60 + 30; // 20:30
    return time >= openTime && time <= closeTime;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) {
      setError('Số điện thoại phải đủ 10 số.');
      return;
    }

    if (!validateTime(time)) {
      setError('Vui lòng chọn thời gian từ 7:30 đến 20:30.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const reservationDateTime = `${date}T${time}:00`;
      
      await reservationApi.create({
        customerName: name,
        phone,
        email,
        reservationAt: reservationDateTime,
        notes: note
      });

      alert('Đặt bàn thành công! Chúng tôi sẽ liên hệ lại với bạn để xác nhận.');
      navigate('/menu');
    } catch (error) {
      console.error('Lỗi khi đặt bàn:', error);
      setError('Có lỗi xảy ra khi đặt bàn. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <section className="py-20 bg-gray-800 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-yellow-400 mb-4 text-center">Đặt Bàn</h2>
          {error && (
            <div className="max-w-lg mx-auto mb-4 bg-red-500 text-white p-4 rounded-lg">
              {error}
            </div>
          )}
          <form onSubmit={handleBookingSubmit} className="max-w-lg mx-auto bg-gray-700 p-8 rounded-lg shadow-xl">
            {isLoading && (
              <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
              </div>
            )}
            <div className="mb-4">
              <label htmlFor="name" className="block text-lg font-medium">Họ và tên</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 mt-2 text-lg text-gray-800 rounded-md"
                placeholder="Nhập họ tên của bạn"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="phone" className="block text-lg font-medium">Số điện thoại</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                pattern="[0-9]{10}"
                className="w-full p-3 mt-2 text-lg text-gray-800 rounded-md"
                placeholder="Nhập số điện thoại (10 số)"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-lg font-medium">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 mt-2 text-lg text-gray-800 rounded-md"
                placeholder="Nhập email của bạn"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="date" className="block text-lg font-medium">Ngày đặt</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                className="w-full p-3 mt-2 text-lg text-gray-800 rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="time" className="block text-lg font-medium">Giờ đặt (7:30 - 20:30)</label>
              <select
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-3 mt-2 text-lg text-gray-800 rounded-md"
                required
              >
                <option value="">Chọn giờ</option>
                <option value="07:30">07:30</option>
                <option value="08:00">08:00</option>
                <option value="08:30">08:30</option>
                <option value="09:00">09:00</option>
                <option value="09:30">09:30</option>
                <option value="10:00">10:00</option>
                <option value="10:30">10:30</option>
                <option value="11:00">11:00</option>
                <option value="11:30">11:30</option>
                <option value="12:00">12:00</option>
                <option value="12:30">12:30</option>
                <option value="13:00">13:00</option>
                <option value="13:30">13:30</option>
                <option value="14:00">14:00</option>
                <option value="14:30">14:30</option>
                <option value="15:00">15:00</option>
                <option value="15:30">15:30</option>
                <option value="16:00">16:00</option>
                <option value="16:30">16:30</option>
                <option value="17:00">17:00</option>
                <option value="17:30">17:30</option>
                <option value="18:00">18:00</option>
                <option value="18:30">18:30</option>
                <option value="19:00">19:00</option>
                <option value="19:30">19:30</option>
                <option value="20:00">20:00</option>
                <option value="20:30">20:30</option>
              </select>
              <div className="mt-1 text-sm text-gray-400">
                Nhà hàng phục vụ từ 7:30 sáng đến 20:30 tối, mỗi lượt 30 phút
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="note" className="block text-lg font-medium">Ghi chú</label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-3 mt-2 text-lg text-gray-800 rounded-md"
                placeholder="Nhập yêu cầu về bàn (nếu có)"
                rows={3}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full p-4 text-lg font-bold rounded-lg transition-all ${
                isLoading
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
              }`}
            >
              {isLoading ? 'Đang xử lý...' : 'Đặt bàn'}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Booking;


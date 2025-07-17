// src/pages/Booking.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Booking = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) {
      alert('Số điện thoại phải đủ 10 số.');
      return;
    }
    alert(`Đặt bàn thành công!\nTên: ${name}\nSố điện thoại: ${phone}\nEmail: ${email}\nNgày: ${date}\nGiờ: ${time}\nGhi chú: ${note}`);
    navigate('/menu');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <section className="py-20 bg-gray-800 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-yellow-400 mb-4 text-center">Đặt Bàn</h2>
          <form onSubmit={handleBookingSubmit} className="max-w-lg mx-auto bg-gray-700 p-8 rounded-lg shadow-xl">
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
              <label htmlFor="phone" className="block text-lg font-medium">Số điện thoại</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 mt-2 text-lg text-gray-800 rounded-md"
                placeholder="Nhập số điện thoại của bạn"
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
                className="w-full p-3 mt-2 text-lg text-gray-800 rounded-md"
                required
                min={today}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="time" className="block text-lg font-medium">Giờ đặt</label>
              <input
                type="time"
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-3 mt-2 text-lg text-gray-800 rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="note" className="block text-lg font-medium">Ghi chú</label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-3 mt-2 text-lg text-gray-800 rounded-md"
                placeholder="Ghi chú thêm (nếu có)"
                rows={3}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg text-xl font-semibold"
            >
              Xác Nhận Đặt Bàn
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Booking;


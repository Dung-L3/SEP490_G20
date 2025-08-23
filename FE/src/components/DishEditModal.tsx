import React, { useState } from 'react';
import type { DishModalProps } from '../types/DishModalProps';

export default function DishEditModal({ dish, onChange, onImageUrl, onCancel, onSave, error }: DishModalProps) {
  const [imageUrl, setImageUrl] = useState(dish.imageUrl || '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Sửa món ăn</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên món *</label>
            <input
              type="text"
              name="dishName"
              value={dish.dishName}
              onChange={onChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Nhập tên món ăn"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Danh mục *</label>
            <select
              name="categoryId"
              value={dish.categoryId}
              onChange={onChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Chọn danh mục</option>
              <option value={1}>Món chính</option>
              <option value={2}>Món phụ</option>
              <option value={3}>Đồ uống</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Đơn vị *</label>
            <input
              type="text"
              name="unit"
              value={dish.unit}
              onChange={onChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ví dụ: Bát, Đĩa, Phần,..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Giá *</label>
            <div className="relative">
              <input
                type="text"
                name="price"
                value={dish.price}
                onChange={onChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-12"
                placeholder="Nhập giá món ăn"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1 pointer-events-none">
                <span className="text-gray-500">VNĐ</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">URL ảnh món ăn</label>
            <div className="mt-1">
              <input
                type="text"
                name="imageUrl"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  onImageUrl(e.target.value);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Nhập URL ảnh từ internet (http:// hoặc https://)"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
            <select
              name="status"
              value={dish.status.toString()}
              onChange={onChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="true">Còn</option>
              <option value="false">Hết món</option>
            </select>
          </div>

          {imageUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Xem trước ảnh:</p>
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
                onError={() => {
                  const defaultImage = 'https://res.cloudinary.com/dx1iwvfdm/image/upload/v1704297479/default-image_qo4zv3.jpg';
                  setImageUrl(defaultImage);
                  onImageUrl(defaultImage);
                }}
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

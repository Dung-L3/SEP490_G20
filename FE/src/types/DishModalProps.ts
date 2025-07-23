import type { ChangeEvent } from 'react';

export interface DishModalProps {
  monAn: {
    ten: string;
    gia: string;
    anh: string;
    trangThai: string;
  };
  khiThayDoi: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  khiThayDoiUrlAnh: (giaTri: string) => void;
  khiHuy: () => void;
  khiLuu: () => Promise<void>;
}

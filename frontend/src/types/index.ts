export interface UserSession {
  userId: string;
  username: string;
  role: 'STAFF' | 'MANAGER' | 'HR_STAFF' | 'HR_MANAGER' | 'ACCOUNTANT';
  maPB: 'BOD' | 'HR' | 'IT' | 'ACC' | 'MKT';
}

export interface Employee {
  maNV: string;
  hoTen: string | '***'; 
  ngaySinh: string | '***'; 
  sdt: string | '***';
  luong?: number; 
  maSoThue: string;
  maPB: string;
}

export interface Project {
  maDA: string;
  tenDA: string;
  nganSach: number;
  ngayBatDau: string;
  trangThai: string;
  olsLabel: 'PUB' | 'CONF' | 'SEC';
}

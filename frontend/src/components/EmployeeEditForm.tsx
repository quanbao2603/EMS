'use client';

import { useState, useEffect } from 'react';
import { Employee } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, AlertCircle } from 'lucide-react';

interface EmployeeEditFormProps {
  employee: Employee | null;
  onClose: () => void;
  onSave: (id: string, data: Partial<Employee>) => Promise<void>;
}

export function EmployeeEditForm({ employee, onClose, onSave }: EmployeeEditFormProps) {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState<Partial<Employee>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    }
  }, [employee]);

  // Cho phép edit form nếu là HR_MANAGER hoặc HR_STAFF. (HR_STAFF vẫn bị DB Trigger ORA-20403 chặn)
  const canEditSalary = user?.role === 'HR_MANAGER' || user?.role === 'HR_STAFF';
  const canViewSalary = user?.role !== 'STAFF' && user?.role !== 'HR_STAFF';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    setIsSubmitting(true);
    // Gửi toàn bộ payload để Backend & DB tự xử lý bảo mật
    await onSave(employee.maNV, formData);
    setIsSubmitting(false);
  };

  return (
    <Sheet open={!!employee} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="bg-gray-950 border-l border-gray-800 text-gray-100 sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-gray-100">Cập nhật thông tin nhân viên</SheetTitle>
          <SheetDescription className="text-gray-400">
            Chỉnh sửa thông tin cho mã nhân viên {employee?.maNV}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hoTen" className="text-gray-300">Họ Tên</Label>
              <Input id="hoTen" name="hoTen" value={formData.hoTen || ''} onChange={handleChange} className="bg-gray-900 border-gray-800 text-white focus-visible:ring-blue-500" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sdt" className="text-gray-300">Số Điện Thoại</Label>
              <Input id="sdt" name="sdt" value={formData.sdt || ''} onChange={handleChange} className="bg-gray-900 border-gray-800 text-white focus-visible:ring-blue-500" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maPB" className="text-gray-300">Phòng Ban</Label>
              <Input id="maPB" name="maPB" value={formData.maPB || ''} onChange={handleChange} className="bg-gray-900 border-gray-800 text-white focus-visible:ring-blue-500" />
            </div>

            {/* Hiển thị luôn ô lương cho HR_STAFF để họ nhập và bị văng lỗi */}
            {(canViewSalary || user?.role === 'HR_STAFF') && (
              <div className="space-y-2">
                <Label htmlFor="luong" className="text-gray-300">Mức Lương (VND)</Label>
                <div className="relative">
                  <Input
                    id="luong"
                    name="luong"
                    type="number"
                    value={formData.luong || ''}
                    onChange={handleChange}
                    disabled={!canEditSalary}
                    className={`bg-gray-900 border-gray-800 text-white focus-visible:ring-blue-500 ${!canEditSalary ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  {user?.role === 'HR_STAFF' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 flex items-center gap-1 text-xs font-semibold">
                      <AlertCircle className="w-4 h-4" /> (Test Database Block)
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <SheetFooter className="mt-8">
            <Button type="button" variant="outline" onClick={onClose} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? 'Đang lưu...' : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

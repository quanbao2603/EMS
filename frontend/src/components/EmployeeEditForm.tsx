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
import { Save, Lock } from 'lucide-react';

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

  // Chỉ HR_MANAGER được sửa Lương. HR_STAFF vẫn thấy ô này (disabled) để biết
  // mức lương hiện tại, nhưng DB Trigger sẽ chặn nếu cố sửa giá trị.
  // (Form Sửa chỉ mở được bởi HR_MANAGER/HR_STAFF nên luôn hiển thị ô này.)
  const canEditSalary = user?.role === 'HR_MANAGER';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    setIsSubmitting(true);
    await onSave(employee.maNV, formData);
    setIsSubmitting(false);
  };

  return (
    <Sheet open={!!employee} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="bg-zinc-950/95 border-l border-white/10 text-zinc-100 sm:max-w-md overflow-y-auto backdrop-blur-xl">
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
              <Input id="hoTen" name="hoTen" value={formData.hoTen || ''} onChange={handleChange} className="bg-zinc-950/60 border-white/10 text-white focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/60" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sdt" className="text-gray-300">Số Điện Thoại</Label>
              <Input id="sdt" name="sdt" value={formData.sdt || ''} onChange={handleChange} className="bg-zinc-950/60 border-white/10 text-white focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/60" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maPB" className="text-gray-300">Phòng Ban</Label>
              <Input id="maPB" name="maPB" value={formData.maPB || ''} onChange={handleChange} className="bg-zinc-950/60 border-white/10 text-white focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/60" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="luong" className="text-gray-300">Mức Lương (VND)</Label>
              <Input
                id="luong"
                name="luong"
                type="number"
                value={formData.luong || ''}
                onChange={handleChange}
                disabled={!canEditSalary}
                className="bg-gray-900 border-gray-800 text-white focus-visible:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
              />
              {!canEditSalary && (
                <p className="flex items-center gap-1.5 text-xs text-amber-400/90">
                  <Lock className="w-3 h-3" /> Chỉ Trưởng phòng HR được sửa mức lương
                </p>
              )}
            </div>
          </div>

          <SheetFooter className="mt-8">
            <Button type="button" variant="outline" onClick={onClose} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">
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

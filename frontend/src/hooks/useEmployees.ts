import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/utils/axiosClient';
import { Employee } from '@/types';
import { triggerSecurityToast } from '@/utils/SecurityToast';

type ApiError = { response?: { status?: number; data?: { message?: string } } };

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.get('/employees');
      setEmployees(res.data);
    } catch (error: unknown) {
      setError((error as ApiError)?.response?.data?.message || 'Không thể tải danh sách nhân sự.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEmployee = async (id: string, data: Partial<Employee>) => {
    try {
      await axiosClient.put(`/employees/${id}`, data);
      await fetchEmployees();
      return true;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.response?.status === 403) {
        const msg = apiError.response.data?.message || 'Không có quyền cập nhật mức lương hoặc thông tin này.';
        triggerSecurityToast(msg);
      } else {
        triggerSecurityToast(apiError.response?.data?.message || 'Lỗi hệ thống');
      }
      return false;
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return { employees, loading, error, updateEmployee, refetch: fetchEmployees };
}

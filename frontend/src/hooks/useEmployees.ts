import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/utils/axiosClient';
import { Employee } from '@/types';
import { triggerSecurityToast } from '@/utils/SecurityToast';

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/employees');
      setEmployees(res.data);
    } catch (error) {
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
    } catch (error: any) {
      if (error.response?.status === 403) {
        triggerSecurityToast('Không có quyền cập nhật mức lương hoặc thông tin này.');
      }
      return false;
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return { employees, loading, updateEmployee, refetch: fetchEmployees };
}

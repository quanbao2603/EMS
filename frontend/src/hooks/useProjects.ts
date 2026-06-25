import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/utils/axiosClient';
import { Project } from '@/types';

type ApiError = { response?: { data?: { message?: string } } };

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.get('/projects');
      setProjects(res.data);
    } catch (err: unknown) {
      setError((err as ApiError)?.response?.data?.message || 'Không thể tải danh sách dự án.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loading, error, refetch: fetchProjects };
}

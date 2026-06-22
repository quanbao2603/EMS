import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/utils/axiosClient';
import { Project } from '@/types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/projects');
      setProjects(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loading, refetch: fetchProjects };
}

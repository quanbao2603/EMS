'use client';

import { useProjects } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LockIcon, Calendar, DollarSign, Activity } from 'lucide-react';
import { format } from 'date-fns';

export default function ProjectsPage() {
  const { projects, loading } = useProjects();

  const renderOlsBadge = (label: string) => {
    if (label === 'PUB') {
      return <Badge className="bg-green-900/50 text-green-400 hover:bg-green-900 border border-green-800">Công khai</Badge>;
    }
    if (label === 'CONF') {
      return <Badge className="bg-yellow-900/50 text-yellow-400 hover:bg-yellow-900 border border-yellow-800">Nội bộ</Badge>;
    }
    if (label === 'SEC') {
      return (
        <Badge className="bg-red-900/50 text-red-400 border-red-700 shadow-md hover:bg-red-900 flex items-center">
          <LockIcon className="w-3 h-3 mr-1" /> Tuyệt mật
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-100">Quản lý Dự án</h1>
      
      {loading ? (
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <Card key={proj.maDA} className={`shadow-sm transition-all hover:shadow-lg bg-gray-900 border-gray-800 ${proj.olsLabel === 'SEC' ? 'border-red-900/50 border-2 bg-red-950/10' : ''}`}>
              <CardHeader className="pb-3 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-gray-100">{proj.tenDA}</CardTitle>
                  <CardDescription className="text-sm text-gray-400 mt-1">{proj.maDA}</CardDescription>
                </div>
                {renderOlsBadge(proj.olsLabel)}
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mt-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-300">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(proj.nganSach)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-300">{proj.ngayBatDau ? format(new Date(proj.ngayBatDau), 'dd/MM/yyyy') : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-300">{proj.trangThai}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {projects.length === 0 && <p className="col-span-3 text-center text-gray-500 py-10">Không có dữ liệu dự án.</p>}
        </div>
      )}
    </div>
  );
}

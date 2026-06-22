'use client';

import { useState } from 'react';
import axiosClient from '@/utils/axiosClient';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axiosClient.post('/auth/login', {
        username,
        password
      });

      const token = response.data.access_token;
      login(token);
      
      toast.success('Đăng nhập thành công');
      router.push('/employees');
    } catch (err: any) {
      toast.error('Tài khoản hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 absolute inset-0 z-50">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800 shadow-2xl">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-900/50 rounded-full flex items-center justify-center mb-4 border border-blue-800">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-100">Đăng nhập hệ thống</CardTitle>
          <CardDescription className="text-gray-400">
            Hệ thống Quản lý Nhân sự EMS
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">Tên đăng nhập</Label>
              <Input 
                id="username" 
                placeholder="Nhập tên đăng nhập..." 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-gray-950 border-gray-800 text-white focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Mật khẩu</Label>
              <Input 
                id="password" 
                type="password"
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-950 border-gray-800 text-white focus-visible:ring-blue-500"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" type="submit" disabled={loading}>
              {loading ? 'Đang xác thực...' : 'Đăng nhập'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

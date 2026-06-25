'use client';

import { useState } from 'react';
import axiosClient from '@/utils/axiosClient';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ShieldCheck, Loader2, User, KeyRound } from 'lucide-react';
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
    } catch {
      toast.error('Tài khoản hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-start justify-center bg-zinc-950 absolute inset-0 z-50 overflow-y-auto px-4 py-12">
      {/* Technical grid backdrop */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '42px 42px',
        }}
      />
      {/* Emerald vault glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(16,185,129,0.16), transparent 55%), radial-gradient(circle at 100% 100%, rgba(16,185,129,0.08), transparent 45%)',
        }}
      />
      {/* Fixed grain (perf-safe: not on a scrolling container) */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <Card className="relative z-10 w-full max-w-md border-white/10 bg-zinc-900/60 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="flex flex-col items-center pt-8 pb-2">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 motion-safe:animate-ping motion-reduce:hidden" />
            <div className="relative w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" strokeWidth={1.75} />
            </div>
          </div>
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-emerald-400/80 mb-1.5">
            Truy cập bảo mật
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Đăng nhập hệ thống</h1>
          <p className="text-sm text-zinc-400 mt-1">Hệ thống Quản lý Nhân sự EMS</p>
        </CardHeader>
        <form onSubmit={handleLogin} className="flex flex-col">
          <CardContent className="space-y-4 pt-4 pb-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-zinc-300">Tên đăng nhập</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="username"
                  placeholder="Nhập tên đăng nhập..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-10 pl-9 bg-zinc-950/60 border-white/10 text-white focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/60"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Mật khẩu</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 pl-9 bg-zinc-950/60 border-white/10 text-white focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/60"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="mt-2 pt-6 pb-8">
            <Button
              className="w-full h-10 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

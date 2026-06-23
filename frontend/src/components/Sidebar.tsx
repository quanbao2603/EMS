'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Users, Briefcase, ShieldAlert, LogOut, Shield, History } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  if (!user && pathname !== '/login') return null;
  if (pathname === '/login') return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { name: 'Nhân sự', href: '/employees', icon: Users, roles: ['STAFF', 'MANAGER', 'HR_STAFF', 'HR_MANAGER', 'ACCOUNTANT'] },
    { name: 'Lịch sử thay đổi', href: '/employees/history', icon: History, roles: ['HR_MANAGER'] },
    { name: 'Dự án', href: '/projects', icon: Briefcase, roles: ['STAFF', 'MANAGER', 'HR_STAFF', 'HR_MANAGER', 'ACCOUNTANT'] },
    { name: 'Giám sát HR', href: '/audit', icon: ShieldAlert, roles: ['HR_MANAGER'] },
  ];

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full text-gray-100">
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <Shield className="w-6 h-6 text-blue-500 mr-2" />
        <span className="text-xl font-bold tracking-tight">EMS Admin</span>
      </div>
      
      <div className="p-4 border-b border-gray-800 bg-gray-800/50">
        <p className="text-sm font-semibold truncate text-white">{user?.username}</p>
        <div className="flex gap-2 mt-2">
          <span className="text-xs px-2 py-1 bg-blue-900/50 text-blue-300 rounded border border-blue-800 font-mono">
            {user?.role}
          </span>
          <span className="text-xs px-2 py-1 bg-purple-900/50 text-purple-300 rounded border border-purple-800 font-mono">
            {user?.maPB}
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          if (user && !item.roles.includes(user.role)) return null;
          
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-red-400 hover:bg-red-950/50 hover:text-red-300 rounded-md transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}

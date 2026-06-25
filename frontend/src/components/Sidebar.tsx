'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Users,
  Briefcase,
  ShieldAlert,
  LogOut,
  ShieldCheck,
  History,
  X,
  Wallet,
  Clock,
  type LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useSidebarStore } from '@/store/useSidebarStore';
import { navActive, navInactive, navSectionLabel } from '@/lib/ui-classes';
import { cn } from '@/lib/utils';

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  roles: string[];
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Nghiệp vụ',
    items: [
      { name: 'Nhân sự', href: '/employees', icon: Users, roles: ['STAFF', 'MANAGER', 'HR_STAFF', 'HR_MANAGER', 'ACCOUNTANT'] },
      { name: 'Chấm công', href: '/attendance', icon: Clock, roles: ['STAFF', 'MANAGER', 'HR_STAFF', 'HR_MANAGER', 'ACCOUNTANT'] },
      { name: 'Dự án', href: '/projects', icon: Briefcase, roles: ['STAFF', 'MANAGER', 'HR_STAFF', 'HR_MANAGER', 'ACCOUNTANT'] },
      { name: 'Bảng tính lương', href: '/payroll', icon: Wallet, roles: ['ACCOUNTANT'] },
    ],
  },
  {
    label: 'Giám sát HR',
    items: [
      { name: 'Lịch sử thay đổi', href: '/employees/history', icon: History, roles: ['HR_MANAGER'] },
      { name: 'Giám sát HR', href: '/audit', icon: ShieldAlert, roles: ['HR_MANAGER'] },
    ],
  },
];

const ROLE_LABEL: Record<string, string> = {
  HR_MANAGER: 'Trưởng phòng HR',
  HR_STAFF: 'Nhân viên HR',
  MANAGER: 'Quản lý',
  STAFF: 'Nhân viên',
  ACCOUNTANT: 'Kế toán',
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { isOpen, close } = useSidebarStore();

  if (!user && pathname !== '/login') return null;
  if (pathname === '/login') return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(user!.role)),
  })).filter((group) => group.items.length > 0);

  const allVisibleItems = visibleGroups.flatMap((g) => g.items);
  const activeHref = allVisibleItems
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const initials =
    user?.username
      ?.split('.')
      .map((part) => part[0]?.toUpperCase())
      .join('')
      .slice(0, 2) || 'U';

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed z-50 inset-y-0 left-0 w-64 flex flex-col h-full text-zinc-100 transition-transform duration-200 lg:static lg:translate-x-0',
          'border-r border-white/[0.06] bg-zinc-950/95 backdrop-blur-xl',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Điều hướng chính"
      >
        {/* Brand */}
        <div className="shrink-0 px-4 pt-4 pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 shrink-0 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <ShieldCheck className="w-[18px] h-[18px] text-emerald-400" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-500/70 leading-none">
                  Hệ thống EMS
                </p>
                <p className="text-[15px] font-semibold tracking-tight text-zinc-50 truncate mt-1">
                  EMS Admin
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={close}
              className="lg:hidden shrink-0 text-zinc-400 hover:text-zinc-100 p-1.5 rounded-md hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
              aria-label="Đóng menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Compact user */}
        <div className="shrink-0 px-3 pb-2">
          <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 bg-white/[0.03]">
            <div
              className="w-8 h-8 shrink-0 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center"
              aria-hidden
            >
              <span className="text-xs font-semibold text-emerald-300">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-100 truncate leading-tight">{user?.username}</p>
              <p className="text-[11px] text-zinc-500 truncate leading-tight mt-0.5">
                {ROLE_LABEL[user?.role ?? ''] ?? user?.role}
                <span className="text-zinc-600 mx-1">·</span>
                {user?.maPB}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5" aria-label="Menu">
          {visibleGroups.map((group) => (
            <div key={group.label}>
              <p className={cn(navSectionLabel, 'px-2.5 mb-1.5')}>{group.label}</p>
              <ul className="space-y-0.5" role="list">
                {group.items.map((item) => {
                  const isActive = item.href === activeHref;
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={close}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40',
                          isActive ? navActive : navInactive,
                        )}
                      >
                        <Icon
                          className={cn(
                            'w-[18px] h-[18px] shrink-0',
                            isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-200',
                          )}
                          strokeWidth={isActive ? 2 : 1.75}
                        />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="shrink-0 px-3 py-3 mt-auto space-y-2">
          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm font-medium transition-colors',
              'text-zinc-400 hover:text-red-400 hover:bg-red-500/10',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30',
              'active:scale-[0.98]',
            )}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
            <span>Đăng xuất</span>
          </button>
          <p className="px-2.5 text-[10px] font-mono text-zinc-600 tracking-wide">
            Oracle EMS · Secure HR
          </p>
        </div>
      </aside>
    </>
  );
}

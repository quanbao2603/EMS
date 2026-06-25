'use client';

import { usePathname } from 'next/navigation';
import { Menu, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useSidebarStore } from '@/store/useSidebarStore';

export function MobileHeader() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { toggle } = useSidebarStore();

  if (!user || pathname === '/login') return null;

  return (
    <div className="lg:hidden sticky top-0 z-30 flex items-center gap-3 h-14 px-4 border-b border-white/10 bg-zinc-950/90 backdrop-blur-xl">
      <button
        onClick={toggle}
        className="text-zinc-300 hover:text-white p-1.5 -ml-1.5 rounded-md hover:bg-zinc-800/80 transition-colors active:scale-95"
        aria-label="Mở menu"
      >
        <Menu className="w-5 h-5" />
      </button>
      <ShieldCheck className="w-5 h-5 text-emerald-400" />
      <span className="font-semibold text-zinc-100">EMS Admin</span>
    </div>
  );
}

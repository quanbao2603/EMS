/** Centralized color mappings so badge colors stay consistent across pages. */

export const DEPARTMENT_BADGE_STYLES: Record<string, string> = {
  BOD: 'bg-rose-900/40 text-rose-300 border-rose-800',
  HR: 'bg-violet-900/40 text-violet-300 border-violet-800',
  IT: 'bg-blue-900/40 text-blue-300 border-blue-800',
  ACC: 'bg-amber-900/40 text-amber-300 border-amber-800',
  MKT: 'bg-emerald-900/40 text-emerald-300 border-emerald-800',
};

export function departmentBadgeClass(maPB: string): string {
  return DEPARTMENT_BADGE_STYLES[maPB] || 'border-gray-700 text-gray-300';
}

export const OLS_LABEL_CONFIG: Record<string, { text: string; className: string }> = {
  PUB: { text: 'Công khai', className: 'bg-green-900/50 text-green-400 hover:bg-green-900 border border-green-800' },
  CONF: { text: 'Nội bộ', className: 'bg-yellow-900/50 text-yellow-400 hover:bg-yellow-900 border border-yellow-800' },
  SEC: { text: 'Tuyệt mật', className: 'bg-red-900/50 text-red-400 border-red-700 shadow-md hover:bg-red-900' },
};

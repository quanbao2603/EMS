export type SortDirection = 'asc' | 'desc';

export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function matchesFields(fields: Array<string | null | undefined>, query: string): boolean {
  const normalized = normalizeQuery(query);
  if (!normalized) return true;
  return fields.some((field) => (field ?? '').toLowerCase().includes(normalized));
}

export function compareStrings(a: string, b: string, direction: SortDirection): number {
  const result = a.localeCompare(b, 'vi', { sensitivity: 'base' });
  return direction === 'asc' ? result : -result;
}

export function compareNumbers(a: number, b: number, direction: SortDirection): number {
  const result = a - b;
  return direction === 'asc' ? result : -result;
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const end = Math.min(start + pageSize, total);

  return {
    items: items.slice(start, end),
    total,
    totalPages,
    page: safePage,
    pageSize,
    from: total === 0 ? 0 : start + 1,
    to: end,
  };
}

export function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b, 'vi'));
}

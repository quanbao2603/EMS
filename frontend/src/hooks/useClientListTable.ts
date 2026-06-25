'use client';

import { useEffect, useMemo, useState } from 'react';
import { paginate, type SortDirection } from '@/lib/list-utils';

export interface SortOption<T> {
  key: string;
  label: string;
  compare: (a: T, b: T) => number;
}

interface UseClientListTableOptions<T> {
  items: T[];
  searchMatcher?: (item: T, query: string) => boolean;
  filterMatcher?: (item: T, filters: Record<string, string>) => boolean;
  sortOptions?: SortOption<T>[];
  defaultSortKey?: string;
  defaultSortDirection?: SortDirection;
  defaultFilters?: Record<string, string>;
  initialPageSize?: number;
}

export function useClientListTable<T>({
  items,
  searchMatcher,
  filterMatcher,
  sortOptions = [],
  defaultSortKey = '',
  defaultSortDirection = 'desc',
  defaultFilters = {},
  initialPageSize = 10,
}: UseClientListTableOptions<T>) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>(defaultFilters);
  const [sortKey, setSortKey] = useState(defaultSortKey || sortOptions[0]?.key || '');
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  useEffect(() => {
    setPage(1);
  }, [search, filters, sortKey, sortDirection, pageSize, items.length]);

  const filteredItems = useMemo(() => {
    let result = items;

    if (searchMatcher && search.trim()) {
      result = result.filter((item) => searchMatcher(item, search));
    }

    if (filterMatcher) {
      result = result.filter((item) => filterMatcher(item, filters));
    }

    const sorter = sortOptions.find((option) => option.key === sortKey);
    if (sorter) {
      result = [...result].sort((a, b) => {
        const base = sorter.compare(a, b);
        return sortDirection === 'asc' ? base : -base;
      });
    }

    return result;
  }, [items, search, filters, sortKey, sortDirection, searchMatcher, filterMatcher, sortOptions]);

  const pagination = useMemo(
    () => paginate(filteredItems, page, pageSize),
    [filteredItems, page, pageSize],
  );

  const setFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setSearch('');
    setFilters(defaultFilters);
    setSortKey(defaultSortKey || sortOptions[0]?.key || '');
    setSortDirection(defaultSortDirection);
    setPage(1);
  };

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return {
    search,
    setSearch,
    filters,
    setFilter,
    sortKey,
    setSortKey,
    sortDirection,
    setSortDirection,
    toggleSortDirection,
    page,
    setPage,
    pageSize,
    setPageSize,
    filteredItems,
    paginatedItems: pagination.items,
    totalFiltered: pagination.total,
    totalPages: pagination.totalPages,
    from: pagination.from,
    to: pagination.to,
    resetFilters,
  };
}

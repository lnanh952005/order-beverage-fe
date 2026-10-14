import * as React from 'react';
import { useSearchParams } from 'react-router';
import type { DatePreset, GroupByPeriod } from '../types/reports.types';

const formatDateStr = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const computePresetDates = (preset: DatePreset): { from: string; to: string } => {
  const now = new Date();
  const to = formatDateStr(now);

  switch (preset) {
    case 'today':
      return { from: to, to };
    case '7days': {
      const past = new Date(now);
      past.setDate(past.getDate() - 6);
      return { from: formatDateStr(past), to };
    }
    case '30days': {
      const past = new Date(now);
      past.setDate(past.getDate() - 29);
      return { from: formatDateStr(past), to };
    }
    case 'thisMonth': {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: formatDateStr(firstDay), to };
    }
    default: {
      const past = new Date(now);
      past.setDate(past.getDate() - 29);
      return { from: formatDateStr(past), to };
    }
  }
};

export function useReportFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlFrom = searchParams.get('from');
  const urlTo = searchParams.get('to');
  const urlGroupBy = searchParams.get('groupBy') as GroupByPeriod | null;
  const urlLimit = searchParams.get('limit');
  const urlPreset = searchParams.get('preset') as DatePreset | null;

  // Defaults if missing in URL
  const defaultDates = React.useMemo(() => computePresetDates('30days'), []);

  const from = urlFrom || defaultDates.from;
  const to = urlTo || defaultDates.to;
  const groupBy: GroupByPeriod =
    urlGroupBy === 'week' || urlGroupBy === 'month' ? urlGroupBy : 'day';
  const limit = urlLimit ? Math.max(1, Math.min(50, Number(urlLimit))) : 10;
  const preset: DatePreset = urlPreset || (urlFrom || urlTo ? 'custom' : '30days');

  const updateFilters = React.useCallback(
    (updates: {
      from?: string;
      to?: string;
      groupBy?: GroupByPeriod;
      limit?: number;
      preset?: DatePreset;
    }) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (updates.from !== undefined) next.set('from', updates.from);
        if (updates.to !== undefined) next.set('to', updates.to);
        if (updates.groupBy !== undefined) next.set('groupBy', updates.groupBy);
        if (updates.limit !== undefined) next.set('limit', String(updates.limit));
        if (updates.preset !== undefined) next.set('preset', updates.preset);
        return next;
      });
    },
    [setSearchParams],
  );

  const setPreset = React.useCallback(
    (newPreset: DatePreset) => {
      if (newPreset === 'custom') {
        updateFilters({ preset: 'custom' });
        return;
      }
      const dates = computePresetDates(newPreset);
      updateFilters({
        preset: newPreset,
        from: dates.from,
        to: dates.to,
      });
    },
    [updateFilters],
  );

  const setCustomRange = React.useCallback(
    (newFrom: string, newTo: string) => {
      updateFilters({
        preset: 'custom',
        from: newFrom,
        to: newTo,
      });
    },
    [updateFilters],
  );

  const setGroupBy = React.useCallback(
    (newGroupBy: GroupByPeriod) => {
      updateFilters({ groupBy: newGroupBy });
    },
    [updateFilters],
  );

  const setLimit = React.useCallback(
    (newLimit: number) => {
      updateFilters({ limit: newLimit });
    },
    [updateFilters],
  );

  return {
    from,
    to,
    groupBy,
    limit,
    preset,
    setPreset,
    setCustomRange,
    setGroupBy,
    setLimit,
  };
}

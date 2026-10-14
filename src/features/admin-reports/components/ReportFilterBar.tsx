import * as React from 'react';
import { Calendar, RefreshCw, Layers } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import type { DatePreset, GroupByPeriod } from '../types/reports.types';

interface ReportFilterBarProps {
  preset: DatePreset;
  from: string;
  to: string;
  groupBy: GroupByPeriod;
  isFetching?: boolean;
  onSelectPreset: (preset: DatePreset) => void;
  onChangeCustomRange: (from: string, to: string) => void;
  onChangeGroupBy: (groupBy: GroupByPeriod) => void;
  onRefresh: () => void;
}

const PRESET_OPTIONS: Array<{ label: string; value: DatePreset }> = [
  { label: 'Hôm nay', value: 'today' },
  { label: '7 ngày qua', value: '7days' },
  { label: '30 ngày qua', value: '30days' },
  { label: 'Tháng này', value: 'thisMonth' },
  { label: 'Tùy chỉnh', value: 'custom' },
];

const GROUP_BY_OPTIONS: Array<{ label: string; value: GroupByPeriod }> = [
  { label: 'Ngày', value: 'day' },
  { label: 'Tuần', value: 'week' },
  { label: 'Tháng', value: 'month' },
];

export function ReportFilterBar({
  preset,
  from,
  to,
  groupBy,
  isFetching = false,
  onSelectPreset,
  onChangeCustomRange,
  onChangeGroupBy,
  onRefresh,
}: ReportFilterBarProps) {
  const handleApplyCustom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newFrom = formData.get('from')?.toString();
    const newTo = formData.get('to')?.toString();
    if (newFrom && newTo) {
      onChangeCustomRange(newFrom, newTo);
    }
  };

  return (
    <div className="bg-card border rounded-xl p-4 shadow-xs space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Thời gian:
          </span>
          {PRESET_OPTIONS.map((opt) => {
            const isActive = preset === opt.value;
            return (
              <Button
                key={opt.value}
                type="button"
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSelectPreset(opt.value)}
                className={`text-xs h-8 px-3 ${
                  isActive ? 'shadow-xs' : 'text-muted-foreground'
                }`}
              >
                {opt.label}
              </Button>
            );
          })}
        </div>

        {/* GroupBy & Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 border rounded-lg p-1 bg-muted/40">
            <span className="text-xs font-medium text-muted-foreground px-2 flex items-center gap-1">
              <Layers className="h-3 w-3" />
              Gom nhóm:
            </span>
            {GROUP_BY_OPTIONS.map((opt) => {
              const isSelected = groupBy === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChangeGroupBy(opt.value)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors font-medium ${
                    isSelected
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isFetching}
            className="h-8 gap-1.5 text-xs"
            title="Làm mới dữ liệu"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-primary' : ''}`}
            />
            <span className="hidden sm:inline">Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Custom Date Range Picker when 'custom' is active */}
      {preset === 'custom' && (
        <form
          key={`${from}-${to}`}
          onSubmit={handleApplyCustom}
          className="pt-3 border-t flex flex-wrap items-center gap-3 text-xs"
        >
          <span className="text-muted-foreground font-medium">Khoảng ngày:</span>
          <div className="flex items-center gap-2">
            <Input
              name="from"
              type="date"
              defaultValue={from}
              className="h-8 text-xs w-36"
              required
            />
            <span className="text-muted-foreground">đến</span>
            <Input
              name="to"
              type="date"
              defaultValue={to}
              className="h-8 text-xs w-36"
              required
            />
          </div>
          <Button type="submit" size="sm" className="h-8 text-xs px-3">
            Áp dụng
          </Button>
        </form>
      )}
    </div>
  );
}

"use client";

import { TimeRange } from "@/types/dashboard";
import { Button } from "@/components/ui/Button";

type TimeRangeSelectorProps = {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
  customStartDate: string;
  customEndDate: string;
  onCustomStartDateChange: (value: string) => void;
  onCustomEndDateChange: (value: string) => void;
};

const ranges: { label: string; value: TimeRange }[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Custom", value: "custom" },
];

export function TimeRangeSelector({
  value,
  onChange,
  customStartDate,
  customEndDate,
  onCustomStartDateChange,
  onCustomEndDateChange,
}: TimeRangeSelectorProps) {
  const isCustom = value === "custom";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
        {ranges.map((range) => (
          <Button key={range.value} variant={range.value === value ? "primary" : "secondary"} size="sm" onClick={() => onChange(range.value)}>
            {range.label}
          </Button>
        ))}
        <div
          aria-hidden={!isCustom}
          className={`grid w-full gap-2 overflow-hidden transition-all duration-200 sm:w-auto sm:grid-cols-2 ${
            isCustom ? "max-h-20 translate-y-0 opacity-100" : "pointer-events-none max-h-0 -translate-y-1 opacity-0"
          }`}
        >
          <label className="sr-only" htmlFor="custom-start-date">
            Start date
          </label>
          <input
            id="custom-start-date"
            type="date"
            value={customStartDate}
            onChange={(event) => onCustomStartDateChange(event.target.value)}
            className="h-8 rounded-md border border-slate-300 px-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <label className="sr-only" htmlFor="custom-end-date">
            End date
          </label>
          <input
            id="custom-end-date"
            type="date"
            value={customEndDate}
            onChange={(event) => onCustomEndDateChange(event.target.value)}
            className="h-8 rounded-md border border-slate-300 px-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>
      </div>
    </div>
  );
}

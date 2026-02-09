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
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap gap-2">
        {ranges.map((range) => (
          <Button key={range.value} variant={range.value === value ? "primary" : "secondary"} size="sm" onClick={() => onChange(range.value)}>
            {range.label}
          </Button>
        ))}
      </div>
      {value === "custom" ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Start date
            <input
              type="date"
              value={customStartDate}
              onChange={(event) => onCustomStartDateChange(event.target.value)}
              className="h-10 rounded-md border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            End date
            <input
              type="date"
              value={customEndDate}
              onChange={(event) => onCustomEndDateChange(event.target.value)}
              className="h-10 rounded-md border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}

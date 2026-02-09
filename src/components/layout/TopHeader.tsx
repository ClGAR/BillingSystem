import { ReactNode } from "react";

type TopHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export function TopHeader({ title, subtitle, actions }: TopHeaderProps) {
  return (
    <header className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        {subtitle ? <p className="text-sm text-slate-600">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

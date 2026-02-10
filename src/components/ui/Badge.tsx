import { ReactNode } from "react";

type BadgeVariant = "neutral" | "success" | "warning" | "danger";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-slate-100 text-slate-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
};

export function Badge({ children, variant = "neutral" }: BadgeProps) {
  return (
    <span className={`inline-flex min-w-[72px] items-center justify-center rounded-full px-2.5 py-1 text-center text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}

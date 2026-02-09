import Link from "next/link";
import { ExpensesForm } from "@/components/encoder/ExpensesForm";
import { LeaderSelector } from "@/components/encoder/LeaderSelector";
import { TargetRatioForm } from "@/components/encoder/TargetRatioForm";
import { TopHeader } from "@/components/layout/TopHeader";
import { initialExpenses, initialTargetRatio, leaders } from "@/lib/mock/encoder";

export default function EncoderPage() {
  return (
    <section className="space-y-4">
      <TopHeader
        title="Encoder"
        subtitle="Encoder/Index - mock settings and updates"
        actions={
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
          >
            Home
          </Link>
        }
      />
      <TargetRatioForm initialValue={initialTargetRatio} />
      <LeaderSelector leaders={leaders} />
      <ExpensesForm initialExpenses={initialExpenses} />
    </section>
  );
}

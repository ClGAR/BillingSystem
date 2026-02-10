import { SummaryStat } from "@/types/dashboard";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

type SummaryCardGridProps = {
  stats: SummaryStat[];
};

const trendToVariant: Record<SummaryStat["trend"], "success" | "warning" | "neutral"> = {
  up: "success",
  down: "warning",
  neutral: "neutral",
};

export function SummaryCardGrid({ stats }: SummaryCardGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.id}>
          <div className="flex items-start justify-between">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <Badge variant={trendToVariant[stat.trend]}>{stat.trend}</Badge>
          </div>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{stat.value}</p>
        </Card>
      ))}
    </div>
  );
}

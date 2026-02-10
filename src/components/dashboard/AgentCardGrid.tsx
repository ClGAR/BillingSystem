import { AgentPerformance } from "@/types/dashboard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type AgentCardGridProps = {
  agents: AgentPerformance[];
  onAgentSelect: (agent: AgentPerformance) => void;
};

function getAgentInitials(name: string) {
  const nameParts = name.trim().split(/\s+/).filter(Boolean);

  if (nameParts.length === 0) {
    return "?";
  }

  if (nameParts.length === 1) {
    return nameParts[0].slice(0, 2).toUpperCase();
  }

  return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
}

function getStatusStripeClass(status: string) {
  switch (status) {
    case "active":
      return "bg-emerald-300";
    case "idle":
      return "bg-slate-300";
    default:
      return "bg-slate-300";
  }
}

export function AgentCardGrid({ agents, onAgentSelect }: AgentCardGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {agents.map((agent) => (
        <button
          key={agent.id}
          type="button"
          onClick={() => onAgentSelect(agent)}
          className="text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
        >
          <Card className="relative h-full overflow-hidden transition-colors hover:bg-slate-50">
            <div className={`absolute inset-y-0 left-0 w-1 ${getStatusStripeClass(agent.status)}`} />
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-700">
                  {getAgentInitials(agent.name)}
                </span>
                <h3 className="truncate font-semibold text-slate-900">{agent.name}</h3>
              </div>
              <Badge variant={agent.status === "active" ? "success" : "neutral"}>{agent.status}</Badge>
            </div>
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              <p>Sales: ${agent.sales.toLocaleString()}</p>
              <p>Target: ${agent.target.toLocaleString()}</p>
              <p>Conversion: {agent.conversionRate}%</p>
            </div>
          </Card>
        </button>
      ))}
    </div>
  );
}

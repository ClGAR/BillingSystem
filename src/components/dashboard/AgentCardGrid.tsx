import { AgentPerformance } from "@/types/dashboard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type AgentCardGridProps = {
  agents: AgentPerformance[];
  onAgentSelect: (agent: AgentPerformance) => void;
};

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
          <Card className="h-full transition-colors hover:bg-slate-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">{agent.name}</h3>
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

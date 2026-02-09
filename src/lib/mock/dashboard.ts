import { AgentPerformance, SummaryStat } from "@/types/dashboard";

export const dashboardSummary: SummaryStat[] = [
  { id: "total-sales", label: "Total Sales", value: "$18,420", trend: "up" },
  { id: "avg-ticket", label: "Avg Ticket", value: "$94", trend: "neutral" },
  { id: "transactions", label: "Transactions", value: "196", trend: "up" },
  { id: "returns", label: "Returns", value: "3", trend: "down" },
];

export const dashboardAgents: AgentPerformance[] = [
  { id: "a1", name: "Alex Rivera", sales: 6200, target: 7000, conversionRate: 37, status: "active" },
  { id: "a2", name: "Jordan Kim", sales: 5400, target: 6500, conversionRate: 33, status: "active" },
  { id: "a3", name: "Taylor Chen", sales: 4200, target: 6000, conversionRate: 29, status: "idle" },
];

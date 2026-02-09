export type TimeRange = "daily" | "weekly" | "monthly" | "custom";

export type SummaryStat = {
  id: string;
  label: string;
  value: string;
  trend: "up" | "down" | "neutral";
};

export type AgentPerformance = {
  id: string;
  name: string;
  sales: number;
  target: number;
  conversionRate: number;
  status: "active" | "idle";
};

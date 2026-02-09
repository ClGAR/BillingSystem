import { AgentPerformance, SummaryStat } from "@/types/dashboard";

export type SalesDataset = {
  label: string;
  summary: SummaryStat[];
  agents: AgentPerformance[];
};

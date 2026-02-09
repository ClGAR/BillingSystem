import { SalesDataset } from "@/types/sales";

export const salesDataset: SalesDataset = {
  label: "Sales API Dataset",
  summary: [
    { id: "api-total", label: "API Total Sales", value: "$12,980", trend: "up" },
    { id: "api-orders", label: "API Orders", value: "141", trend: "up" },
    { id: "api-errors", label: "Sync Errors", value: "0", trend: "down" },
    { id: "api-latency", label: "Avg Response", value: "112ms", trend: "neutral" },
  ],
  agents: [
    { id: "s1", name: "Morgan Lee", sales: 4800, target: 5500, conversionRate: 35, status: "active" },
    { id: "s2", name: "Casey Brooks", sales: 4300, target: 5200, conversionRate: 31, status: "active" },
    { id: "s3", name: "Riley Santos", sales: 3880, target: 5000, conversionRate: 28, status: "idle" },
  ],
};

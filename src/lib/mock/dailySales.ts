import { BreakdownRow, CashOnHandRow, InventoryRow, RecentSale, ReportRow, SalesMetricKpi } from "@/types/dailySales";

export const salesOverviewKpis: SalesMetricKpi[] = [
  { id: "k1", label: "Gross Sales", value: "$8,450" },
  { id: "k2", label: "Net Sales", value: "$8,210" },
  { id: "k3", label: "Transactions", value: "87" },
];

export const recentSales: RecentSale[] = [
  { id: "r1", invoice: "INV-1001", customer: "Walk-in", amount: 120.5, date: "2026-02-08" },
  { id: "r2", invoice: "INV-1002", customer: "Acme Corp", amount: 340, date: "2026-02-08" },
  { id: "r3", invoice: "INV-1003", customer: "Bluebird LLC", amount: 87.25, date: "2026-02-08" },
];

export const reportsRows: ReportRow[] = [
  { id: "rep1", name: "Discounts", value: "$145.00" },
  { id: "rep2", name: "Voids", value: "$35.00" },
  { id: "rep3", name: "Refunds", value: "$60.00" },
];

export const inventoryRows: InventoryRow[] = [
  { id: "i1", item: "Package A", beginning: 120, sold: 34, ending: 86 },
  { id: "i2", item: "Retail B", beginning: 80, sold: 28, ending: 52 },
  { id: "i3", item: "Retail C", beginning: 60, sold: 18, ending: 42 },
];

export const packageBreakdown: BreakdownRow[] = [
  { id: "p1", label: "Starter Pack", amount: 2400 },
  { id: "p2", label: "Growth Pack", amount: 1800 },
];

export const retailBreakdown: BreakdownRow[] = [
  { id: "rt1", label: "Supplements", amount: 1210 },
  { id: "rt2", label: "Accessories", amount: 670 },
];

export const paymentBreakdown: BreakdownRow[] = [
  { id: "pm1", label: "Cash", amount: 3020 },
  { id: "pm2", label: "Card", amount: 2480 },
  { id: "pm3", label: "Transfer", amount: 950 },
];

export const cashOnHandRows: CashOnHandRow[] = [
  { id: "c1", label: "Opening Cash", amount: 500 },
  { id: "c2", label: "Cash Sales", amount: 3020 },
  { id: "c3", label: "Petty Cash", amount: 150 },
];

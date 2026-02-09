export type RecentSale = {
  id: string;
  invoice: string;
  customer: string;
  amount: number;
  date: string;
};

export type ReportRow = {
  id: string;
  name: string;
  value: string;
};

export type InventoryRow = {
  id: string;
  item: string;
  beginning: number;
  sold: number;
  ending: number;
};

export type BreakdownRow = {
  id: string;
  label: string;
  amount: number;
};

export type CashOnHandRow = {
  id: string;
  label: string;
  amount: number;
};

export type SalesMetricKpi = {
  id: string;
  label: string;
  value: string;
};

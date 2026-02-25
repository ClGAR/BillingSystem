import { supabase } from "../lib/supabaseClient";

export type FetchSalesReportParams = {
  dateFrom?: string;
  dateTo?: string;
  search?: string;
};

export type SalesEntryRecord = {
  sale_entry_id: string | number | null;
  sale_date: string | null;
  member_name: string | null;
  po_number: string | null;
  username: string | null;
  package_type: string | null;
  quantity: number | string | null;
  total_sales: number | string | null;
  created_at: string | null;
};

export type PaymentBreakdownRow = {
  mode: string;
  amount: number;
};

export type PaymentBreakdownResult = {
  rows: PaymentBreakdownRow[];
  total: number;
};

type PaymentRawRow = {
  sale_entry_id: string | number | null;
  mode?: string | null;
  mode_of_payment?: string | null;
  payment_mode?: string | null;
  amount: number | string | null;
};

function toNumber(value: number | string | null | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function fetchFilteredSaleEntryIds(
  params: FetchSalesReportParams
): Promise<Array<string | number>> {
  let query = supabase.schema("public").from("sales_entries").select("id");

  if (params.dateFrom) {
    query = query.gte("sale_date", params.dateFrom);
  }

  if (params.dateTo) {
    query = query.lte("sale_date", params.dateTo);
  }

  if (params.search && params.search.trim()) {
    const q = params.search.trim();
    query = query.or(
      `member_name.ilike.%${q}%,po_number.ilike.%${q}%,username.ilike.%${q}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || "Failed to fetch matching sales entries.");
  }

  return (data ?? [])
    .map((row) => row.id)
    .filter((id): id is string | number => typeof id === "string" || typeof id === "number");
}

async function fetchPaymentsWithModeColumn(
  modeColumn: "mode" | "mode_of_payment" | "payment_mode",
  saleEntryIds?: Array<string | number>
): Promise<PaymentRawRow[]> {
  let query = supabase
    .schema("public")
    .from("sales_entry_payments")
    .select(`sale_entry_id,${modeColumn},amount`);

  if (saleEntryIds && saleEntryIds.length > 0) {
    query = query.in("sale_entry_id", saleEntryIds);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as PaymentRawRow[];
}

export async function fetchSalesEntries(
  params: FetchSalesReportParams
): Promise<SalesEntryRecord[]> {
  let query = supabase
    .schema("public")
    .from("v_sales_report")
    .select(
      "sale_entry_id,sale_date,member_name,po_number,username,package_type,quantity,total_sales,created_at"
    )
    .order("created_at", { ascending: false });

  if (params.dateFrom) {
    query = query.gte("sale_date", params.dateFrom);
  }

  if (params.dateTo) {
    query = query.lte("sale_date", params.dateTo);
  }

  if (params.search && params.search.trim()) {
    const q = params.search.trim();
    query = query.or(
      `member_name.ilike.%${q}%,po_number.ilike.%${q}%,username.ilike.%${q}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || "Failed to fetch sales report entries.");
  }

  return (data ?? []) as SalesEntryRecord[];
}

export async function fetchPaymentBreakdown(
  params: FetchSalesReportParams
): Promise<PaymentBreakdownResult> {
  const hasFilters = Boolean(params.dateFrom || params.dateTo || params.search?.trim());
  let saleEntryIds: Array<string | number> | undefined;

  if (hasFilters) {
    saleEntryIds = await fetchFilteredSaleEntryIds(params);
    if (saleEntryIds.length === 0) {
      return { rows: [], total: 0 };
    }
  }

  let paymentRows: PaymentRawRow[] = [];
  const modeColumns: Array<"mode" | "mode_of_payment" | "payment_mode"> = [
    "mode",
    "mode_of_payment",
    "payment_mode"
  ];
  let lastError: Error | null = null;

  for (const modeColumn of modeColumns) {
    try {
      paymentRows = await fetchPaymentsWithModeColumn(modeColumn, saleEntryIds);
      lastError = null;
      break;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Failed to fetch payment breakdown.");
    }
  }

  if (lastError) {
    throw new Error(lastError.message || "Failed to fetch payment breakdown.");
  }

  const groupedByMode = new Map<string, number>();
  paymentRows.forEach((row) => {
    const mode = row.mode || row.mode_of_payment || row.payment_mode || "Unknown";
    groupedByMode.set(mode, (groupedByMode.get(mode) ?? 0) + toNumber(row.amount));
  });

  const rows = Array.from(groupedByMode.entries())
    .map(([mode, amount]) => ({ mode, amount }))
    .sort((a, b) => b.amount - a.amount);

  const total = rows.reduce((sum, row) => sum + row.amount, 0);

  return { rows, total };
}

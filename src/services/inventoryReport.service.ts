import { supabase } from "../lib/supabaseClient";

export type FetchInventoryReportParams = {
  dateFrom?: string;
  dateTo?: string;
  search?: string;
};

export type InventoryReportRecord = {
  sale_entry_id: string | number | null;
  sale_date: string | null;
  member_name: string | null;
  po_number: string | null;
  username: string | null;
  package_type: string | null;
  quantity: number | string | null;
  blister_count: number | string | null;
  released_bottle: number | string | null;
  released_blister: number | string | null;
  to_follow_bottle: number | string | null;
  to_follow_blister: number | string | null;
  total_sales: number | string | null;
  created_at: string | null;
};

export async function fetchInventoryReport(
  params: FetchInventoryReportParams
): Promise<InventoryReportRecord[]> {
  let query = supabase
    .schema("public")
    .from("v_inventory_report")
    .select(
      "sale_entry_id,sale_date,member_name,po_number,username,package_type,quantity,blister_count,released_bottle,released_blister,to_follow_bottle,to_follow_blister,total_sales,created_at"
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
    throw new Error(error.message || "Failed to fetch inventory report.");
  }

  return (data ?? []) as InventoryReportRecord[];
}

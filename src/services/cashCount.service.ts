import { supabase } from "../lib/supabaseClient";

export type CashCountLineInput = {
  denomination: number;
  pieces: number;
};

export type DailyCashCountHeader = {
  id: string | number;
  cash_date: string;
  created_by: string;
  total_cash: number;
  created_at?: string | null;
  updated_at?: string | null;
};

export type DailyCashCountLine = {
  id?: string | number;
  denomination: number;
  pieces: number;
  amount: number;
};

export type DailyCashCountResult = {
  header: DailyCashCountHeader;
  lines: DailyCashCountLine[];
};

const lineForeignKeys = ["daily_cash_count_id", "cash_count_id", "header_id"] as const;

function toNumber(value: number | string | null | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error(error?.message || "User not authenticated.");
  }
  return data.user.id;
}

async function getCashHeader(
  cashDate: string,
  userId: string
): Promise<DailyCashCountHeader | null> {
  const { data, error } = await supabase
    .from("daily_cash_counts")
    .select("id,cash_date,created_by,total_cash,created_at,updated_at")
    .eq("cash_date", cashDate)
    .eq("created_by", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(error.message || "Failed to fetch daily cash count header.");
  }

  const header = (data ?? [])[0];
  if (!header) {
    return null;
  }

  return {
    id: header.id,
    cash_date: String(header.cash_date),
    created_by: String(header.created_by),
    total_cash: toNumber(header.total_cash),
    created_at: header.created_at,
    updated_at: header.updated_at
  };
}

async function getCashLines(headerId: string | number): Promise<DailyCashCountLine[]> {
  let lastError: Error | null = null;

  for (const key of lineForeignKeys) {
    const { data, error } = await supabase
      .from("daily_cash_count_lines")
      .select("id,denomination,pieces,amount")
      .eq(key, headerId)
      .order("denomination", { ascending: false });

    if (error) {
      lastError = new Error(error.message || "Failed to fetch cash count lines.");
      continue;
    }

    return (data ?? []).map((line) => {
      const denomination = toNumber(line.denomination);
      const pieces = toNumber(line.pieces);
      return {
        id: line.id,
        denomination,
        pieces,
        amount: toNumber(line.amount) || denomination * pieces
      };
    });
  }

  throw lastError ?? new Error("Failed to fetch cash count lines.");
}

async function deleteCashLines(headerId: string | number): Promise<(typeof lineForeignKeys)[number]> {
  let lastError: Error | null = null;

  for (const key of lineForeignKeys) {
    const { error } = await supabase
      .from("daily_cash_count_lines")
      .delete()
      .eq(key, headerId);

    if (error) {
      lastError = new Error(error.message || "Failed to clear cash count lines.");
      continue;
    }

    return key;
  }

  throw lastError ?? new Error("Failed to clear cash count lines.");
}

export async function getDailyCashCount(cashDate: string): Promise<DailyCashCountResult | null> {
  const userId = await getCurrentUserId();
  const header = await getCashHeader(cashDate, userId);

  if (!header) {
    return null;
  }

  const lines = await getCashLines(header.id);

  return { header, lines };
}

export async function upsertDailyCashCount(
  cashDate: string,
  lines: CashCountLineInput[]
): Promise<DailyCashCountResult> {
  const userId = await getCurrentUserId();
  const normalizedLines = lines.map((line) => {
    const denomination = toNumber(line.denomination);
    const pieces = toNumber(line.pieces);
    return {
      denomination,
      pieces,
      amount: denomination * pieces
    };
  });
  const totalCash = normalizedLines.reduce((sum, line) => sum + line.amount, 0);

  const existingHeader = await getCashHeader(cashDate, userId);
  let headerId: string | number;

  if (existingHeader) {
    const { data, error } = await supabase
      .from("daily_cash_counts")
      .update({ total_cash: totalCash })
      .eq("id", existingHeader.id)
      .select("id")
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to update daily cash count.");
    }

    headerId = data.id;
  } else {
    const { data, error } = await supabase
      .from("daily_cash_counts")
      .insert({
        cash_date: cashDate,
        created_by: userId,
        total_cash: totalCash
      })
      .select("id")
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to create daily cash count.");
    }

    headerId = data.id;
  }

  const lineKey = await deleteCashLines(headerId);

  if (normalizedLines.length > 0) {
    const insertPayload = normalizedLines.map((line) => ({
      [lineKey]: headerId,
      denomination: line.denomination,
      pieces: line.pieces,
      amount: line.amount
    }));

    const { error } = await supabase.from("daily_cash_count_lines").insert(insertPayload);

    if (error) {
      throw new Error(error.message || "Failed to save cash count lines.");
    }
  }

  const saved = await getDailyCashCount(cashDate);

  if (!saved) {
    throw new Error("Cash count was saved but could not be reloaded.");
  }

  return saved;
}

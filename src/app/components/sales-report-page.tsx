import React, { useEffect, useMemo, useState } from 'react';
import { Search, Printer } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { getDailyCashCount, type DailyCashCountResult } from '../../services/cashCount.service';
import {
  fetchPaymentBreakdown,
  type PaymentBreakdownRow
} from '../../services/salesReport.service';

type SummaryRow = {
  packageName: string;
  qty: number;
  price: number;
  amount: number;
};

type ReferenceRow = {
  label: string;
  reference: string;
  amount: number;
};

type GroupedPaymentRow = {
  normalizedKey: string;
  mode: string;
  amount: number;
};

type SummaryLike = {
  qty: number;
  price: number;
  amount: number;
};

type SalesEntry = {
  id: string | number | null;
  sale_date: string | null;
  created_at: string | null;
  member_name: string | null;
  package_type: string | null;
  quantity: number | string | null;
  total_sales: number | string | null;
  [key: string]: unknown;
};

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP'
});

const compactTableClassName = 'w-full border-collapse table-fixed';
const tableHeaderClassName = 'border border-gray-700 bg-gray-100 px-1 py-[2px] text-left font-semibold';
const tableCellClassName = 'border border-gray-700 px-1 py-[2px]';
const numberCellClassName = `${tableCellClassName} text-right tabular-nums`;
const DENOMS = [1000, 500, 200, 100, 50, 20, 10, 5, 1, 0.25];
const PACKAGE_PRICE: Record<string, number> = {
  'Silver (1 bottle)': 3500,
  'Gold (3 bottles)': 10500,
  'Platinum (10 bottles)': 35000,
  'Retail (1 bottle)': 2280,
  'Blister (1 blister pack)': 779
};
const PACKAGE_ORDER = [
  'Platinum (10 bottles)',
  'Gold (3 bottles)',
  'Silver (1 bottle)',
  'Retail (1 bottle)',
  'Blister (1 blister pack)'
];
const FIXED_PACKAGE_LEVEL_ROWS = ['Platinum', 'Gold', 'Silver'];
const FIXED_RETAIL_ROWS = ['Synbiotic+ (Bottle)', 'Synbiotic+ (Blister)', 'Employees Discount'];
const FIXED_MOBILE_STOCKIST_RETAIL_ROWS = ['Synbiotic+ (Bottle)'];
const FIXED_DEPOT_RETAIL_ROWS = ['Synbiotic+ (Bottle)'];
const FIXED_PAYMENTS = [
  { key: 'Cash on hand', label: 'Cash on hand' },
  { key: 'E-Wallet', label: 'E-Wallet' },
  { key: 'Bank Transfer - Security Bank', label: 'Bank Transfer - Security Bank' },
  { key: 'Maya (IGI)', label: 'Maya (IGI)' },
  { key: 'Maya (ATC)', label: 'Maya (ATC)' },
  { key: 'SB Collect (IGI)', label: 'SB Collect (IGI)' },
  { key: 'SB Collect (ATC)', label: 'SB Collect (ATC)' },
  { key: 'Accounts Receivable - CSA', label: 'Accounts Receivable - CSA' },
  { key: 'Accounts Receivable - Leaders Support', label: 'Accounts Receivable - Leaders Support' },
  { key: 'Consignment', label: 'Consignment' },
  { key: 'Cheque', label: 'Cheque' },
  { key: 'E-Points', label: 'E-Points' }
];

function toNumber(value: number | string | null | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDateLabel(value: string): string {
  if (!value) {
    return '';
  }
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function modeIncludes(mode: string, tokens: string[]): boolean {
  const normalizedMode = mode.toLowerCase();
  return tokens.every((token) => normalizedMode.includes(token.toLowerCase()));
}

function formatDenomination(value: number): string {
  return value.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

const norm = (s: string) => (s || '').trim().toLowerCase();

function getRow(map: Map<string, SummaryLike>, key: string, fallbackPrice = 0): SummaryLike {
  const r = map.get(norm(key));
  return {
    qty: Number(r?.qty ?? 0),
    price: Number(r?.price ?? fallbackPrice),
    amount: Number(r?.amount ?? 0)
  };
}

function fixedRowsFromMap(labels: string[], map: Map<string, SummaryLike>): SummaryRow[] {
  return labels.map((label) => {
    const row = getRow(map, label);
    return {
      packageName: label,
      qty: row.qty,
      price: row.price,
      amount: row.amount
    };
  });
}

function buildSummaryMapFromEntries(
  entries: SalesEntry[],
  labels: string[],
  options?: { mustInclude?: string[] }
): Map<string, SummaryLike> {
  const map = new Map<string, SummaryLike>();
  const normalizedLabels = labels.map((label) => ({ label, normalized: norm(label) }));
  const mustInclude = (options?.mustInclude ?? []).map((token) => norm(token));

  entries.forEach((entry) => {
    const rawName = String(entry.package_type ?? '').trim();
    if (!rawName) {
      return;
    }
    const normalizedName = norm(rawName);
    if (mustInclude.length > 0 && !mustInclude.every((token) => normalizedName.includes(token))) {
      return;
    }

    const match = normalizedLabels.find(
      ({ normalized }) => normalizedName === normalized || normalizedName.includes(normalized)
    );
    if (!match) {
      return;
    }

    const key = norm(match.label);
    const qty = toNumber(entry.quantity);
    const amount = toNumber(entry.total_sales);
    const current = map.get(key) ?? { qty: 0, price: 0, amount: 0 };
    current.qty += qty;
    current.amount += amount;
    current.price = current.qty > 0 ? current.amount / current.qty : 0;
    map.set(key, current);
  });

  return map;
}

function getFixedPaymentKey(value: string): string | null {
  const key = norm(value);
  if (!key) {
    return null;
  }

  const fixedByExact = FIXED_PAYMENTS.find((payment) => norm(payment.key) === key);
  if (fixedByExact) {
    return fixedByExact.key;
  }

  if (key === 'cash') {
    return 'Cash on hand';
  }
  if (key.includes('e-wallet') || key.includes('ewallet')) {
    return 'E-Wallet';
  }
  if (key.includes('bank') || key.includes('security bank')) {
    return 'Bank Transfer - Security Bank';
  }
  if (key.includes('maya') && key.includes('atc')) {
    return 'Maya (ATC)';
  }
  if (key.includes('maya') && key.includes('igi')) {
    return 'Maya (IGI)';
  }
  if (key === 'maya') {
    return 'Maya (IGI)';
  }
  if (key.includes('sb collect') && key.includes('atc')) {
    return 'SB Collect (ATC)';
  }
  if (key.includes('sb collect') && key.includes('igi')) {
    return 'SB Collect (IGI)';
  }
  if (key.includes('ar') && key.includes('csa')) {
    return 'Accounts Receivable - CSA';
  }
  if (key.includes('leader support') || key.includes('leaders support')) {
    return 'Accounts Receivable - Leaders Support';
  }
  if (key.includes('consignment')) {
    return 'Consignment';
  }
  if (key.includes('cheque') || key.includes('check')) {
    return 'Cheque';
  }
  if (key.includes('e-points') || key.includes('epoints') || key.includes('e points')) {
    return 'E-Points';
  }

  return null;
}

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/(^|[\s(/-])([a-z])/g, (_match, prefix: string, char: string) => {
      return `${prefix}${char.toUpperCase()}`;
    });
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-700">
      <div className="px-2 py-1 font-semibold uppercase bg-gray-100 border-b border-gray-700">
        {title}
      </div>
      <div className="p-1">{children}</div>
    </div>
  );
}

function SummaryTable({
  firstHeader,
  rows,
  totalLabel
}: {
  firstHeader: string;
  rows: SummaryRow[];
  totalLabel: string;
}) {
  const totalQty = rows.reduce((sum, row) => sum + row.qty, 0);
  const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);

  return (
    <table className={compactTableClassName}>
      <colgroup>
        <col style={{ width: '46%' }} />
        <col style={{ width: '10%' }} />
        <col style={{ width: '18%' }} />
        <col style={{ width: '26%' }} />
      </colgroup>
      <thead>
        <tr>
          <th className={tableHeaderClassName}>{firstHeader}</th>
          <th className={`${tableHeaderClassName} text-right`}>QTY</th>
          <th className={`${tableHeaderClassName} text-right`}>PRICE</th>
          <th className={`${tableHeaderClassName} text-right`}>AMOUNT TOTAL</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.packageName}>
            <td className={tableCellClassName}>{row.packageName}</td>
            <td className={numberCellClassName}>{row.qty}</td>
            <td className={numberCellClassName}>{currencyFormatter.format(row.price)}</td>
            <td className={numberCellClassName}>{currencyFormatter.format(row.amount)}</td>
          </tr>
        ))}
        <tr>
          <td className={tableCellClassName}>{totalLabel}</td>
          <td className={numberCellClassName}>{totalQty}</td>
          <td className={numberCellClassName}>-</td>
          <td className={numberCellClassName}>{currencyFormatter.format(totalAmount)}</td>
        </tr>
      </tbody>
    </table>
  );
}

function ReferenceTable({
  firstHeader,
  secondHeader,
  rows,
  loading
}: {
  firstHeader: string;
  secondHeader: string;
  rows: ReferenceRow[];
  loading: boolean;
}) {
  return (
    <table className={compactTableClassName}>
      <colgroup>
        <col style={{ width: '26%' }} />
        <col style={{ width: '54%' }} />
        <col style={{ width: '20%' }} />
      </colgroup>
      <thead>
        <tr>
          <th className={tableHeaderClassName}>{firstHeader}</th>
          <th className={tableHeaderClassName}>{secondHeader}</th>
          <th className={`${tableHeaderClassName} text-right`}>Amount</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan={3} className={`${tableCellClassName} text-center`}>
              Loading...
            </td>
          </tr>
        ) : null}
        {!loading && rows.length === 0 ? (
          <tr>
            <td colSpan={3} className={`${tableCellClassName} text-center`}>
              No records
            </td>
          </tr>
        ) : null}
        {!loading
          ? rows.map((row, index) => (
              <tr key={`${row.label}-${row.reference}-${index}`}>
                <td className={tableCellClassName}>{row.label}</td>
                <td className={tableCellClassName}>{row.reference}</td>
                <td className={numberCellClassName}>{currencyFormatter.format(row.amount)}</td>
              </tr>
            ))
          : null}
      </tbody>
    </table>
  );
}

function MiniTable({
  values
}: {
  values: {
    silver: number;
    gold: number;
    platinum: number;
  };
}) {
  return (
    <table className={compactTableClassName}>
      <colgroup>
        <col style={{ width: '33%' }} />
        <col style={{ width: '33%' }} />
        <col style={{ width: '34%' }} />
      </colgroup>
      <thead>
        <tr>
          <th className={`${tableHeaderClassName} text-center`}>Silver</th>
          <th className={`${tableHeaderClassName} text-center`}>Gold</th>
          <th className={`${tableHeaderClassName} text-center`}>Platinum</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className={`${numberCellClassName} text-center`}>{values.silver}</td>
          <td className={`${numberCellClassName} text-center`}>{values.gold}</td>
          <td className={`${numberCellClassName} text-center`}>{values.platinum}</td>
        </tr>
      </tbody>
    </table>
  );
}

export function SalesReportPage() {
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [searchText, setSearchText] = useState('');
  const search = searchText;
  const setSearch = setSearchText;
  const [entriesRows, setEntriesRows] = useState<SalesEntry[]>([]);
  const [paymentRows, setPaymentRows] = useState<PaymentBreakdownRow[]>([]);
  const [cashCountData, setCashCountData] = useState<DailyCashCountResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildDailyParams = (search?: string) => ({
    dateFrom: reportDate,
    dateTo: reportDate,
    search: search || undefined
  });

  const loadReport = async (params?: { dateFrom?: string; dateTo?: string; search?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const selectedReportDate = params?.dateFrom || reportDate;
      console.log('[SalesReport] reportDate', selectedReportDate);
      const { data: entries, error: entriesError } = await supabase
        .from('sales_entries')
        .select('id, sale_date, created_at, package_type, total_sales')
        .eq('sale_date', selectedReportDate)
        .order('created_at', { ascending: true });

      if (entriesError) {
        console.error('[SalesReport] sales_entries error', entriesError);
        throw new Error(entriesError.message || 'Failed to fetch sales report entries.');
      }

      const [paymentBreakdown, cashCount] = await Promise.all([
        fetchPaymentBreakdown({
          dateFrom: selectedReportDate,
          dateTo: selectedReportDate,
          search: params?.search?.trim() || undefined
        }),
        getDailyCashCount(selectedReportDate)
      ]);
      console.log('[SalesReport] entries rows', entries?.length, entries);

      setEntriesRows((entries ?? []) as SalesEntry[]);
      setPaymentRows(paymentBreakdown.rows);
      setCashCountData(cashCount);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Failed to load sales report.';
      setEntriesRows([]);
      setPaymentRows([]);
      setCashCountData(null);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReport(buildDailyParams());
  }, [reportDate]);

  const handleGenerateReport = async () => {
    await loadReport({
      dateFrom: reportDate,
      dateTo: reportDate,
      search: searchText || undefined
    });
  };

  const packageSalesRows = useMemo<SummaryRow[]>(() => {
    const grouped = new Map<string, { label: string; qty: number; amount: number }>();

    entriesRows.forEach((entry) => {
      const packageName = String(entry.package_type ?? '').trim() || 'Unknown';
      const key = norm(packageName);
      const current = grouped.get(key) ?? { label: packageName, qty: 0, amount: 0 };
      const entryQty = toNumber(entry.quantity);
      current.qty += entryQty > 0 ? entryQty : 1;
      current.amount += toNumber(entry.total_sales);
      grouped.set(key, current);
    });

    return Array.from(grouped.entries())
      .map(([, totals]) => ({
        packageName: totals.label,
        qty: totals.qty,
        amount: totals.amount,
        price:
          PACKAGE_PRICE[totals.label] ?? (totals.qty > 0 ? totals.amount / totals.qty : 0)
      }))
      .sort((a, b) => {
        const aIndex = PACKAGE_ORDER.findIndex((pkg) => norm(pkg) === norm(a.packageName));
        const bIndex = PACKAGE_ORDER.findIndex((pkg) => norm(pkg) === norm(b.packageName));
        const aRank = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
        const bRank = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
        if (aRank !== bRank) {
          return aRank - bRank;
        }
        return b.amount - a.amount;
      });
  }, [entriesRows]);

  const reportDateLabel = useMemo(() => {
    return formatDateLabel(reportDate);
  }, [reportDate]);

  const mobileStockistPackageMap = useMemo(
    () =>
      buildSummaryMapFromEntries(entriesRows, FIXED_PACKAGE_LEVEL_ROWS, {
        mustInclude: ['mobile stockist']
      }),
    [entriesRows]
  );
  const mobileStockistPackageRows = useMemo(
    () => fixedRowsFromMap(FIXED_PACKAGE_LEVEL_ROWS, mobileStockistPackageMap),
    [mobileStockistPackageMap]
  );

  const depotPackageMap = useMemo(
    () =>
      buildSummaryMapFromEntries(entriesRows, FIXED_PACKAGE_LEVEL_ROWS, {
        mustInclude: ['depot']
      }),
    [entriesRows]
  );
  const depotPackageRows = useMemo(
    () => fixedRowsFromMap(FIXED_PACKAGE_LEVEL_ROWS, depotPackageMap),
    [depotPackageMap]
  );

  const retailMap = useMemo(
    () => buildSummaryMapFromEntries(entriesRows, FIXED_RETAIL_ROWS),
    [entriesRows]
  );
  const retailRows = useMemo(
    () => fixedRowsFromMap(FIXED_RETAIL_ROWS, retailMap),
    [retailMap]
  );

  const mobileStockistRetailMap = useMemo(
    () =>
      buildSummaryMapFromEntries(entriesRows, FIXED_MOBILE_STOCKIST_RETAIL_ROWS, {
        mustInclude: ['mobile stockist']
      }),
    [entriesRows]
  );
  const mobileStockistRetailRows = useMemo(
    () => fixedRowsFromMap(FIXED_MOBILE_STOCKIST_RETAIL_ROWS, mobileStockistRetailMap),
    [mobileStockistRetailMap]
  );

  const depotRetailMap = useMemo(
    () =>
      buildSummaryMapFromEntries(entriesRows, FIXED_DEPOT_RETAIL_ROWS, {
        mustInclude: ['depot']
      }),
    [entriesRows]
  );
  const depotRetailRows = useMemo(
    () => fixedRowsFromMap(FIXED_DEPOT_RETAIL_ROWS, depotRetailMap),
    [depotRetailMap]
  );

  const grandTotal = useMemo(
    () => entriesRows.reduce((sum, row) => sum + toNumber(row.total_sales), 0),
    [entriesRows]
  );

  const normalizedPaymentRows = useMemo<GroupedPaymentRow[]>(() => {
    const grouped = new Map<string, { amount: number; label: string }>();

    paymentRows.forEach((row) => {
      const rawKey = (row.mode || 'Unknown').trim();
      const key = rawKey || 'Unknown';
      const normalizedKey = key.toUpperCase();
      const current = grouped.get(normalizedKey);
      if (current) {
        current.amount += toNumber(row.amount);
      } else {
        grouped.set(normalizedKey, {
          amount: toNumber(row.amount),
          label: toTitleCase(key)
        });
      }
    });

    return Array.from(grouped.entries())
      .map(([normalizedKey, value]) => ({
        normalizedKey,
        mode: value.label,
        amount: value.amount
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [paymentRows]);

  const fixedPaymentMap = useMemo(() => {
    const payMap = new Map<string, number>();

    paymentRows.forEach((row) => {
      const paymentRow = row as PaymentBreakdownRow & { method?: string; name?: string };
      const rawMethod = String(paymentRow.method ?? paymentRow.mode ?? paymentRow.name ?? '').trim();
      const fixedKey = getFixedPaymentKey(rawMethod);
      if (!fixedKey) {
        return;
      }
      const normalizedKey = norm(fixedKey);
      payMap.set(normalizedKey, (payMap.get(normalizedKey) ?? 0) + toNumber(row.amount));
    });

    return payMap;
  }, [paymentRows]);

  const fixedPaymentRows = useMemo(
    () =>
      FIXED_PAYMENTS.map((fixed) => ({
        label: fixed.label,
        amount: fixedPaymentMap.get(norm(fixed.key)) ?? 0
      })),
    [fixedPaymentMap]
  );

  const fixedPaymentTotal = useMemo(
    () => fixedPaymentRows.reduce((sum, row) => sum + row.amount, 0),
    [fixedPaymentRows]
  );

  const expectedCash = useMemo(
    () => fixedPaymentMap.get(norm('Cash on hand')) ?? 0,
    [fixedPaymentMap]
  );

  const cashLines = cashCountData?.lines ?? [];
  const cashRows = useMemo(() => {
    const piecesByDenom = new Map<number, number>(
      cashLines.map((line) => [Number(line.denomination), Number(line.pieces)])
    );

    return DENOMS.map((denomination) => {
      const rawPieces = piecesByDenom.get(denomination) ?? 0;
      const pieces = Number.isFinite(rawPieces) ? rawPieces : 0;
      return {
        denomination,
        pieces,
        amount: denomination * pieces
      };
    });
  }, [cashLines]);
  const totalCashOnHand = useMemo(
    () => cashRows.reduce((sum, row) => sum + row.amount, 0),
    [cashRows]
  );
  const cashDifference = totalCashOnHand - expectedCash;
  const cashDifferenceStatus = cashDifference > 0 ? 'Over' : cashDifference < 0 ? 'Short' : 'Balanced';

  const bankRows = useMemo<ReferenceRow[]>(
    () =>
      normalizedPaymentRows
        .filter((row) => modeIncludes(row.mode, ['bank']))
        .map((row) => ({
          label: 'Security Bank',
          reference: '-',
          amount: row.amount
        })),
    [normalizedPaymentRows]
  );

  const mayaIgiRows = useMemo<ReferenceRow[]>(
    () =>
      normalizedPaymentRows
        .filter((row) => modeIncludes(row.mode, ['maya', 'igi']) || row.mode.toLowerCase() === 'maya')
        .map((row) => ({
          label: 'Maya',
          reference: '-',
          amount: row.amount
        })),
    [normalizedPaymentRows]
  );

  const sbCollectIgiRows = useMemo<ReferenceRow[]>(
    () =>
      normalizedPaymentRows
        .filter((row) => modeIncludes(row.mode, ['sb collect', 'igi']))
        .map((row) => ({
          label: row.mode,
          reference: '-',
          amount: row.amount
        })),
    [normalizedPaymentRows]
  );

  const sbCollectAtcRows = useMemo<ReferenceRow[]>(
    () =>
      normalizedPaymentRows
        .filter((row) => modeIncludes(row.mode, ['sb collect', 'atc']))
        .map((row) => ({
          label: row.mode,
          reference: '-',
          amount: row.amount
        })),
    [normalizedPaymentRows]
  );

  const arCsaRows = useMemo<ReferenceRow[]>(
    () =>
      normalizedPaymentRows
        .filter((row) => modeIncludes(row.mode, ['ar', 'csa']))
        .map((row) => ({
          label: '-',
          reference: '-',
          amount: row.amount
        })),
    [normalizedPaymentRows]
  );

  const newAccounts = { silver: 0, gold: 0, platinum: 0 };
  const upgrades = { silver: 0, gold: 0, platinum: 0 };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6 erp-title-primary">Sales Report</h1>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="w-full lg:max-w-md">
            <label className="block text-sm text-gray-600 mb-2">Report Date</label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="h-11 w-full px-3 border border-gray-300 rounded-md"
            />
          </div>

          <div className="w-full lg:w-auto lg:ml-auto flex gap-2">
            <button
              type="button"
              onClick={handleGenerateReport}
              className="h-11 px-6 border border-gray-400 rounded-md bg-white text-black hover:bg-gray-100 transition"
            >
              Generate Report
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="h-11 px-4 w-full lg:w-auto border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 print:hidden"
              title="Print"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search table..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full pl-10 pr-3 border border-gray-300 rounded-md"
          />
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        {!loading && !error && entriesRows.length === 0 ? (
          <p className="mt-3 text-sm text-gray-600">No records found for selected date.</p>
        ) : null}
      </div>

      <div id="sales-report-print" className="mx-auto bg-white w-full max-w-[980px] border border-gray-300 p-4 text-[11px] leading-tight">
        <div className="text-center mb-3">
          <p className="font-semibold">Company Name</p>
          <p className="font-semibold">Daily Sales Report</p>
          <p>{reportDateLabel}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-3">
            <Box title="Package Sales Summary">
              <SummaryTable firstHeader="PACKAGE" rows={packageSalesRows} totalLabel="Total Package Sales" />
            </Box>

            <Box title="Mobile Stockist Package">
              <SummaryTable
                firstHeader="PACKAGE"
                rows={mobileStockistPackageRows}
                totalLabel="Total Mobile Stockist Package Sales"
              />
            </Box>

            <Box title="Depot Package">
              <SummaryTable
                firstHeader="PACKAGE"
                rows={depotPackageRows}
                totalLabel="Total Depot Package Sales"
              />
            </Box>

            <Box title="Retail">
              <SummaryTable firstHeader="ITEM" rows={retailRows} totalLabel="Total Retail Sales" />
            </Box>

            <Box title="Mobile Stockist Retail">
              <SummaryTable
                firstHeader="ITEM"
                rows={mobileStockistRetailRows}
                totalLabel="Total Mobile Stockist Retail Sales"
              />
            </Box>

            <Box title="Depot Retail">
              <SummaryTable
                firstHeader="ITEM"
                rows={depotRetailRows}
                totalLabel="Total Depot Retail Sales"
              />
            </Box>

            <Box title="Grand Total">
              <table className={compactTableClassName}>
                <colgroup>
                  <col style={{ width: '70%' }} />
                  <col style={{ width: '30%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <td className={tableCellClassName}>Grand Total</td>
                    <td className={numberCellClassName}>{currencyFormatter.format(grandTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </Box>
          </div>

          <div className="space-y-3">
            <Box title="Cash on Hand">
              <div className="mb-1 space-y-[2px]">
                <div className="flex items-center justify-between border border-gray-700 px-1 py-[2px]">
                  <span>Expected Cash</span>
                  <span className="tabular-nums">{currencyFormatter.format(expectedCash)}</span>
                </div>
                <div className="flex items-center justify-between border border-gray-700 px-1 py-[2px]">
                  <span>Actual Cash on Hand</span>
                  <span className="tabular-nums">{currencyFormatter.format(totalCashOnHand)}</span>
                </div>
                <div className="flex items-center justify-between border border-gray-700 px-1 py-[2px]">
                  <span>Difference ({cashDifferenceStatus})</span>
                  <span className="tabular-nums">{currencyFormatter.format(cashDifference)}</span>
                </div>
              </div>

              <table className={compactTableClassName}>
                <colgroup>
                  <col style={{ width: '50%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '30%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th className={tableHeaderClassName}>Denomination</th>
                    <th className={`${tableHeaderClassName} text-right`}>Pieces</th>
                    <th className={`${tableHeaderClassName} text-right`}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {cashRows.map((row) => (
                    <tr key={row.denomination}>
                      <td className={tableCellClassName}>{formatDenomination(row.denomination)}</td>
                      <td className={numberCellClassName}>{row.pieces}</td>
                      <td className={numberCellClassName}>{currencyFormatter.format(row.amount)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={2} className={tableCellClassName}>
                      TOTAL CASH ON HAND
                    </td>
                    <td className={numberCellClassName}>{currencyFormatter.format(totalCashOnHand)}</td>
                  </tr>
                </tbody>
              </table>
            </Box>

            <Box title="Payment Breakdown">
              <table className={compactTableClassName}>
                <colgroup>
                  <col style={{ width: '70%' }} />
                  <col style={{ width: '30%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th className={tableHeaderClassName}>Payment Method</th>
                    <th className={`${tableHeaderClassName} text-right`}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {fixedPaymentRows.map((row) => (
                    <tr key={row.label}>
                      <td className={tableCellClassName}>{row.label}</td>
                      <td className={numberCellClassName}>{currencyFormatter.format(row.amount)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className={tableCellClassName}>TOTAL</td>
                    <td className={numberCellClassName}>{currencyFormatter.format(fixedPaymentTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </Box>
          </div>

          <div className="col-span-2 grid grid-cols-2 gap-3">
            <Box title="New Accounts">
              <MiniTable values={newAccounts} />
            </Box>
            <Box title="Upgrades">
              <MiniTable values={upgrades} />
            </Box>
          </div>

          <div className="col-span-2 grid grid-cols-2 gap-3">
            <Box title="BANK (Security Bank)">
              <ReferenceTable
                firstHeader="Bank"
                secondHeader="Reference #"
                rows={bankRows}
                loading={loading}
              />
            </Box>
            <Box title="MAYA (IGI)">
              <ReferenceTable
                firstHeader="Maya"
                secondHeader="Reference #"
                rows={mayaIgiRows}
                loading={loading}
              />
            </Box>
          </div>

          <div className="col-span-2 grid grid-cols-2 gap-3">
            <Box title="SB Collect (IGI)">
              <ReferenceTable
                firstHeader="POF/Ref#"
                secondHeader="Reference #"
                rows={sbCollectIgiRows}
                loading={loading}
              />
            </Box>
            <Box title="SB Collect (ATC)">
              <ReferenceTable
                firstHeader="POF/Ref#"
                secondHeader="Reference #"
                rows={sbCollectAtcRows}
                loading={loading}
              />
            </Box>
          </div>

          <div className="col-span-2 grid grid-cols-2 gap-3">
            <Box title="AR CSA">
              <ReferenceTable firstHeader="Name" secondHeader="POF #" rows={arCsaRows} loading={loading} />
            </Box>
            <div />
          </div>

          <div className="col-span-2 grid grid-cols-2 gap-10 pt-2">
            <div>
              <p className="mb-6">Prepared By:</p>
              <div className="border-t border-gray-700 pt-1">Name / Signature</div>
            </div>
            <div>
              <p className="mb-6">Checked By:</p>
              <div className="border-t border-gray-700 pt-1">Name / Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

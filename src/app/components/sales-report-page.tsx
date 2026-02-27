import React, { useEffect, useMemo, useState } from 'react';
import { Search, Printer } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

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

type SalesEntry = {
  id: string | number | null;
  sale_date: string | null;
  created_at: string | null;
  member_name: string | null;
  po_number?: string | null;
  package_type: string | null;
  quantity: number | string | null;
  total_sales: number | string | null;
  [key: string]: unknown;
};

type SalesEntryPaymentRow = {
  mode: string | null;
  mode_type: string | null;
  reference_no?: string | null;
  amount: number | string | null;
  sale_entry_id: string | number | null;
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
const DENOMS = [
  { denom: 1000, key: 'denom_1000' },
  { denom: 500, key: 'denom_500' },
  { denom: 200, key: 'denom_200' },
  { denom: 100, key: 'denom_100' },
  { denom: 50, key: 'denom_50' },
  { denom: 20, key: 'denom_20' },
  { denom: 10, key: 'denom_10' },
  { denom: 5, key: 'denom_5' },
  { denom: 1, key: 'denom_1' },
  { denom: 0.25, key: 'denom_025' }
] as const;
const PACKAGE_PRICE: Record<string, number> = {
  'Mobile Stockist': 0,
  Platinum: 35000,
  Gold: 10500,
  Silver: 3500,
  'Silver (1 bottle)': 3500,
  'Gold (3 bottles)': 10500,
  'Platinum (10 bottles)': 35000,
  'Retail (1 bottle)': 2280,
  'Blister (1 blister pack)': 779,
  'Synbiotic+ (Bottle)': 2280,
  'Synbiotic+ (Blister)': 779,
  'Employees Discount': 0
};
const PACKAGE_ROWS = [
  { key: 'Mobile Stockist', label: 'Mobile Stockist' },
  { key: 'Platinum (10 bottles)', label: 'Platinum' },
  { key: 'Gold (3 bottles)', label: 'Gold' },
  { key: 'Silver (1 bottle)', label: 'Silver' }
];
const PACKAGE_LEVEL_ROWS = [
  { key: 'Platinum (10 bottles)', label: 'Platinum' },
  { key: 'Gold (3 bottles)', label: 'Gold' },
  { key: 'Silver (1 bottle)', label: 'Silver' }
];
const RETAIL_ROWS = [
  { key: 'Synbiotic+ (Bottle)', label: 'Synbiotic+ (Bottle)' },
  { key: 'Synbiotic+ (Blister)', label: 'Synbiotic+ (Blister)' },
  { key: 'Employees Discount', label: 'Employees Discount' }
];
const MOBILE_STOCKIST_RETAIL_ROWS = [{ key: 'Synbiotic+ (Bottle)', label: 'Synbiotic+ (Bottle)' }];
const DEPOT_RETAIL_ROWS = [{ key: 'Synbiotic+ (Bottle)', label: 'Synbiotic+ (Bottle)' }];
const PAYMENT_METHODS = [
  'Cash on hand',
  'E-Wallet',
  'Bank Transfer - Security Bank',
  'Maya (IGI)',
  'Maya (ATC)',
  'SB Collect (IGI)',
  'SB Collect (ATC)',
  'Accounts Receivable - CSA',
  'Accounts Receivable - Leaders Support',
  'Consignment',
  'Cheque',
  'E-Points'
] as const;

function toNumber(value: number | string | null | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function distributeCash(amount: number) {
  let remaining = Math.round(toNumber(amount) * 100);

  const rows = DENOMS.map((d) => {
    const denomCents = Math.round(d.denom * 100);
    const pieces = denomCents > 0 ? Math.floor(remaining / denomCents) : 0;
    remaining = remaining - pieces * denomCents;
    const rowAmount = (pieces * denomCents) / 100;
    return { denomination: d.denom, pieces, amount: rowAmount };
  });

  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  return { rows, total };
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

function formatDenomination(value: number): string {
  return value.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

const normalize = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const norm = (v: unknown) => normalize(v).toLowerCase();
const has = (s: string, needle: string) => s.includes(needle);
const pkg = (entry: SalesEntry) => normalize(entry.package_type) || 'Unknown';

function getEntryQty(entry: SalesEntry): number {
  const qty = toNumber(entry.quantity);
  return qty > 0 ? qty : 1;
}

function getEntryChannel(entry: SalesEntry): string {
  return norm(
    String(
      entry.member_type ??
        entry.sale_channel ??
        entry.channel ??
        ''
    )
  );
}

function toSummaryRowsFromMap(
  templateRows: Array<{ key: string; label: string }>,
  map: Map<string, { qty: number; amount: number }>
): SummaryRow[] {
  return templateRows.map((template) => {
    const value = map.get(norm(template.key)) ?? { qty: 0, amount: 0 };
    const price = PACKAGE_PRICE[template.key] ?? PACKAGE_PRICE[template.label] ?? 0;
    return {
      packageName: template.label,
      qty: value.qty,
      price,
      amount: value.amount
    };
  });
}

function buildSummary(
  entries: SalesEntry[],
  templateRows: Array<{ key: string; label: string }>
): SummaryRow[] {
  const map = new Map<string, { qty: number; amount: number }>();
  templateRows.forEach((row) => map.set(norm(row.key), { qty: 0, amount: 0 }));

  entries.forEach((entry) => {
    const key = norm(pkg(entry));
    if (!map.has(key)) {
      return;
    }
    const current = map.get(key);
    if (!current) {
      return;
    }
    current.qty += getEntryQty(entry);
    current.amount += toNumber(entry.total_sales);
    map.set(key, current);
  });

  return toSummaryRowsFromMap(templateRows, map);
}

function getRetailKey(entry: SalesEntry): string | null {
  const normalizedPackage = norm(pkg(entry));
  if (
    normalizedPackage === norm('Retail (1 bottle)') ||
    normalizedPackage === norm('Synbiotic+ (Bottle)')
  ) {
    return 'Synbiotic+ (Bottle)';
  }
  if (
    normalizedPackage === norm('Blister (1 blister pack)') ||
    normalizedPackage === norm('Synbiotic+ (Blister)')
  ) {
    return 'Synbiotic+ (Blister)';
  }
  if (normalizedPackage.includes('employee')) {
    return 'Employees Discount';
  }
  return null;
}

function buildRetailSummary(
  entries: SalesEntry[],
  templateRows: Array<{ key: string; label: string }>
): SummaryRow[] {
  const map = new Map<string, { qty: number; amount: number }>();
  templateRows.forEach((row) => map.set(norm(row.key), { qty: 0, amount: 0 }));

  entries.forEach((entry) => {
    const retailKey = getRetailKey(entry);
    if (!retailKey) {
      return;
    }
    const key = norm(retailKey);
    if (!map.has(key)) {
      return;
    }
    const current = map.get(key);
    if (!current) {
      return;
    }
    current.qty += getEntryQty(entry);
    current.amount += toNumber(entry.total_sales);
    map.set(key, current);
  });

  return toSummaryRowsFromMap(templateRows, map);
}

function mapPaymentLabel(row: SalesEntryPaymentRow): (typeof PAYMENT_METHODS)[number] {
  const mode = (row.mode || '').toString().trim();
  const type = (row.mode_type || '').toString().trim();

  if (/^cash$/i.test(mode)) return 'Cash on hand';
  if (/e-wallet/i.test(mode)) return 'E-Wallet';
  if (/bank/i.test(mode)) return 'Bank Transfer - Security Bank';

  if (/maya/i.test(mode) && /igi/i.test(type)) return 'Maya (IGI)';
  if (/maya/i.test(mode) && /atc/i.test(type)) return 'Maya (ATC)';
  if (/sb collect/i.test(mode) && /igi/i.test(type)) return 'SB Collect (IGI)';
  if (/sb collect/i.test(mode) && /atc/i.test(type)) return 'SB Collect (ATC)';

  if (/ar/i.test(mode) && /csa/i.test(type)) return 'Accounts Receivable - CSA';
  if (/ar/i.test(mode) && /leader/i.test(type)) return 'Accounts Receivable - Leaders Support';

  if (/consignment/i.test(mode)) return 'Consignment';
  if (/cheque/i.test(mode)) return 'Cheque';
  if (/e-?points/i.test(mode)) return 'E-Points';

  return 'Cash on hand';
}

function getPaymentReference(row: SalesEntryPaymentRow): string {
  const reference = String(
    row.reference_no ??
      row.reference ??
      row.ref_no ??
      ''
  ).trim();
  return reference || '-';
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
  const [paymentRows, setPaymentRows] = useState<SalesEntryPaymentRow[]>([]);
  const [cashCountRow, setCashCountRow] = useState<Record<string, unknown> | null>(null);
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
        .select('id, sale_date, created_at, member_name, po_number, package_type, quantity, total_sales')
        .eq('sale_date', selectedReportDate)
        .order('created_at', { ascending: true });

      if (entriesError) {
        console.error('[SalesReport] sales_entries error', entriesError);
        throw new Error(entriesError.message || 'Failed to fetch sales report entries.');
      }

      const saleEntryIds = (entries ?? [])
        .map((entry) => entry.id)
        .filter((id): id is string | number => typeof id === 'string' || typeof id === 'number');

      let payments: SalesEntryPaymentRow[] = [];
      if (saleEntryIds.length > 0) {
        const { data: paymentData, error: paymentError } = await supabase
          .from('sales_entry_payments')
          .select('mode, mode_type, reference_no, amount, sale_entry_id')
          .in('sale_entry_id', saleEntryIds);

        if (paymentError) {
          console.error('[SalesReport] payments error', paymentError);
        } else {
          payments = (paymentData ?? []) as SalesEntryPaymentRow[];
        }
      }

      let fetchedCashRow: Record<string, unknown> | null = null;
      const { data: cashByCashDate, error: cashByCashDateError } = await supabase
        .from('daily_cash_counts')
        .select('*')
        .eq('cash_date', selectedReportDate)
        .maybeSingle();

      if (cashByCashDateError) {
        console.error('[SalesReport] daily_cash_counts cash_date error', cashByCashDateError);
        const { data: cashBySaleDate, error: cashBySaleDateError } = await supabase
          .from('daily_cash_counts')
          .select('*')
          .eq('sale_date', selectedReportDate)
          .maybeSingle();
        if (cashBySaleDateError) {
          console.error('[SalesReport] daily_cash_counts sale_date error', cashBySaleDateError);
        } else {
          fetchedCashRow = (cashBySaleDate as Record<string, unknown> | null) ?? null;
        }
      } else {
        fetchedCashRow = (cashByCashDate as Record<string, unknown> | null) ?? null;
      }

      console.log('[SalesReport] entries rows', entries?.length, entries);

      setEntriesRows((entries ?? []) as SalesEntry[]);
      setPaymentRows(payments);
      setCashCountRow(fetchedCashRow);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Failed to load sales report.';
      setEntriesRows([]);
      setPaymentRows([]);
      setCashCountRow(null);
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

  const handlePrint = () => {
    const el = document.getElementById('sales-report-print');
    if (!el) {
      return;
    }

    const printWindow = window.open('', '_blank', 'width=1024,height=768');
    if (!printWindow) {
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Sales Report</title>
          <style>
            @page { size: A4; margin: 10mm; }
            html, body { padding: 0; margin: 0; }
            body { font-family: Inter, Arial, sans-serif; color: #111827; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #D1D5DB; padding: 6px; font-size: 11px; vertical-align: top; }
            th { background: #F3F4F6; }
            * { box-shadow: none !important; overflow: visible !important; }
            .no-print { display: none !important; }
            .page { width: 100%; }
          </style>
        </head>
        <body>
          <div class="page">
            ${el.outerHTML}
          </div>
          <script>
            window.onload = () => {
              window.focus();
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const reportDateLabel = useMemo(() => {
    return formatDateLabel(reportDate);
  }, [reportDate]);

  const missingPackageTypeEntries = useMemo(
    () => entriesRows.filter((entry) => normalize(entry.package_type) === ''),
    [entriesRows]
  );

  useEffect(() => {
    if (missingPackageTypeEntries.length > 0) {
      console.warn('[SalesReport] missing package_type rows', missingPackageTypeEntries);
    }
  }, [missingPackageTypeEntries]);

  const packageSalesRows = useMemo(
    () => buildSummary(entriesRows, PACKAGE_ROWS),
    [entriesRows]
  );

  const mobileStockistEntries = useMemo(
    () => entriesRows.filter((entry) => getEntryChannel(entry).includes('mobile stockist')),
    [entriesRows]
  );
  const depotEntries = useMemo(
    () => entriesRows.filter((entry) => getEntryChannel(entry).includes('depot')),
    [entriesRows]
  );

  const mobileStockistPackageRows = useMemo(
    () => buildSummary(mobileStockistEntries, PACKAGE_LEVEL_ROWS),
    [mobileStockistEntries]
  );
  const depotPackageRows = useMemo(
    () => buildSummary(depotEntries, PACKAGE_LEVEL_ROWS),
    [depotEntries]
  );

  const retailRows = useMemo(
    () => buildRetailSummary(entriesRows, RETAIL_ROWS),
    [entriesRows]
  );

  const mobileStockistRetailRows = useMemo(
    () => buildRetailSummary(mobileStockistEntries, MOBILE_STOCKIST_RETAIL_ROWS),
    [mobileStockistEntries]
  );

  const depotRetailRows = useMemo(
    () => buildRetailSummary(depotEntries, DEPOT_RETAIL_ROWS),
    [depotEntries]
  );

  const grandTotal = useMemo(
    () => entriesRows.reduce((sum, row) => sum + toNumber(row.total_sales), 0),
    [entriesRows]
  );

  const fixedPaymentMap = useMemo(() => {
    const breakdownMap = new Map<string, number>();
    PAYMENT_METHODS.forEach((label) => breakdownMap.set(label, 0));

    paymentRows.forEach((payment) => {
      const label = mapPaymentLabel(payment);
      if (!breakdownMap.has(label)) {
        return;
      }
      breakdownMap.set(label, (breakdownMap.get(label) ?? 0) + toNumber(payment.amount));
    });

    return breakdownMap;
  }, [paymentRows]);

  const fixedPaymentRows = useMemo(
    () =>
      PAYMENT_METHODS.map((label) => ({
        label,
        amount: fixedPaymentMap.get(label) ?? 0
      })),
    [fixedPaymentMap]
  );

  const fixedPaymentTotal = useMemo(
    () => fixedPaymentRows.reduce((sum, row) => sum + row.amount, 0),
    [fixedPaymentRows]
  );

  const cashTotal = useMemo(
    () => fixedPaymentMap.get('Cash on hand') ?? 0,
    [fixedPaymentMap]
  );

  const hasDbPieces = useMemo(
    () =>
      Boolean(cashCountRow) &&
      DENOMS.some((denomination) =>
        toNumber(cashCountRow?.[denomination.key] as number | string | null | undefined) > 0
      ),
    [cashCountRow]
  );

  const cashRows = useMemo(() => {
    if (!hasDbPieces) {
      return distributeCash(cashTotal).rows;
    }

    return DENOMS.map((denomination) => {
      const rawPieces = toNumber(cashCountRow?.[denomination.key] as number | string | null | undefined);
      const pieces = Number.isFinite(rawPieces) ? rawPieces : 0;
      return {
        denomination: denomination.denom,
        pieces,
        amount: denomination.denom * pieces
      };
    });
  }, [cashCountRow, cashTotal, hasDbPieces]);
  const totalCashOnHand = useMemo(
    () => cashRows.reduce((sum, row) => sum + row.amount, 0),
    [cashRows]
  );

  const entryById = useMemo(() => {
    const map = new Map<string, SalesEntry>();
    entriesRows.forEach((entry) => {
      if (entry.id === null || entry.id === undefined) {
        return;
      }
      map.set(String(entry.id), entry);
    });
    return map;
  }, [entriesRows]);

  const bankRows = useMemo<ReferenceRow[]>(
    () =>
      paymentRows
        .filter((payment) => {
          const mode = norm(payment.mode);
          const modeType = norm(payment.mode_type);
          const reference = norm(payment.reference_no ?? payment.reference ?? payment.ref_no ?? '');
          const isBankMode = has(mode, 'bank') || has(mode, 'bank transfer');
          return isBankMode && (
            has(modeType, 'security') ||
            has(modeType, 'sec') ||
            has(reference, 'sec') ||
            modeType === ''
          );
        })
        .map((payment) => {
          const modeType = normalize(payment.mode_type);
          return {
            label: modeType || 'Bank',
            reference: getPaymentReference(payment),
            amount: toNumber(payment.amount)
          };
        }),
    [paymentRows]
  );

  const mayaIgiRows = useMemo<ReferenceRow[]>(
    () =>
      paymentRows
        .filter((payment) => {
          const mode = norm(payment.mode);
          const modeType = norm(payment.mode_type);
          const reference = norm(payment.reference_no ?? payment.reference ?? payment.ref_no ?? '');
          return has(mode, 'maya') && (
            has(modeType, 'igi') ||
            has(mode, '(igi)') ||
            has(mode, 'igi') ||
            reference.length > 0
          );
        })
        .map((payment) => ({
          label: 'Maya (IGI)',
          reference: getPaymentReference(payment),
          amount: toNumber(payment.amount)
        })),
    [paymentRows]
  );

  const sbCollectIgiRows = useMemo<ReferenceRow[]>(
    () =>
      paymentRows
        .filter((payment) => {
          const mode = norm(payment.mode);
          const modeType = norm(payment.mode_type);
          const isSbCollect = (has(mode, 'sb') && has(mode, 'collect')) || has(mode, 'sbcollect');
          return isSbCollect && (has(modeType, 'igi') || has(mode, '(igi)') || has(mode, 'igi'));
        })
        .map((payment) => {
          const reference = normalize(payment.reference_no ?? payment.reference ?? payment.ref_no ?? '');
          return {
            label: reference,
            reference,
            amount: toNumber(payment.amount)
          };
        }),
    [paymentRows]
  );

  const sbCollectAtcRows = useMemo<ReferenceRow[]>(
    () =>
      paymentRows
        .filter((payment) => {
          const mode = norm(payment.mode);
          const modeType = norm(payment.mode_type);
          const isSbCollect = (has(mode, 'sb') && has(mode, 'collect')) || has(mode, 'sbcollect');
          return isSbCollect && (has(modeType, 'atc') || has(mode, '(atc)') || has(mode, 'atc'));
        })
        .map((payment) => {
          const reference = normalize(payment.reference_no ?? payment.reference ?? payment.ref_no ?? '');
          return {
            label: reference,
            reference,
            amount: toNumber(payment.amount)
          };
        }),
    [paymentRows]
  );

  const arCsaRows = useMemo<ReferenceRow[]>(
    () =>
      paymentRows
        .filter((payment) => {
          const mode = norm(payment.mode);
          const modeType = norm(payment.mode_type);
          return (has(mode, 'ar') || has(mode, 'accounts receivable')) &&
            (has(modeType, 'csa') || has(mode, '(csa)') || has(mode, 'csa'));
        })
        .map((payment) => {
          const entry = entryById.get(String(payment.sale_entry_id ?? ''));
          return {
            label: normalize(entry?.member_name ?? ''),
            reference: normalize(entry?.po_number ?? ''),
            amount: toNumber(payment.amount)
          };
        }),
    [paymentRows, entryById]
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

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleGenerateReport}
              className="h-11 px-6 text-sm font-medium rounded-md border border-gray-300 bg-white text-black hover:bg-gray-100 transition"
            >
              Generate Report
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="h-11 px-6 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 print:hidden"
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
        {!loading && !error && missingPackageTypeEntries.length > 0 ? (
          <p className="mt-2 text-xs text-amber-700">
            Some rows have missing package_type.
          </p>
        ) : null}
      </div>

      <div id="sales-report-print" className="mx-auto bg-white w-full max-w-[980px] border border-gray-300 p-6 text-[11px] leading-tight">
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

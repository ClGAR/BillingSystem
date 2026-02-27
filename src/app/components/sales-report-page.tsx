import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { FormField } from './form-field';
import { getDailyCashCount, type DailyCashCountResult } from '../../services/cashCount.service';
import {
  fetchPaymentBreakdown,
  fetchSalesEntries,
  type PaymentBreakdownRow,
  type SalesEntryRecord
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

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP'
});

const compactTableClassName = 'w-full border-collapse table-fixed';
const tableHeaderClassName = 'border border-gray-700 bg-gray-100 px-1 py-[2px] text-left font-semibold';
const tableCellClassName = 'border border-gray-700 px-1 py-[2px]';
const numberCellClassName = `${tableCellClassName} text-right tabular-nums`;

function toNumber(value: number | string | null | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
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
  loading,
  totalLabel
}: {
  firstHeader: string;
  rows: SummaryRow[];
  loading: boolean;
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
        {loading ? (
          <tr>
            <td colSpan={4} className={`${tableCellClassName} text-center`}>
              Loading...
            </td>
          </tr>
        ) : null}
        {!loading && rows.length === 0 ? (
          <tr>
            <td colSpan={4} className={`${tableCellClassName} text-center`}>
              No records
            </td>
          </tr>
        ) : null}
        {!loading
          ? rows.map((row) => (
              <tr key={row.packageName}>
                <td className={tableCellClassName}>{row.packageName}</td>
                <td className={numberCellClassName}>{row.qty}</td>
                <td className={numberCellClassName}>{currencyFormatter.format(row.price)}</td>
                <td className={numberCellClassName}>{currencyFormatter.format(row.amount)}</td>
              </tr>
            ))
          : null}
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
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchText, setSearchText] = useState('');
  const [entriesRows, setEntriesRows] = useState<SalesEntryRecord[]>([]);
  const [paymentRows, setPaymentRows] = useState<PaymentBreakdownRow[]>([]);
  const [paymentTotal, setPaymentTotal] = useState(0);
  const [cashCountData, setCashCountData] = useState<DailyCashCountResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReport = async (params?: { dateFrom?: string; dateTo?: string; search?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const selectedCashDate = params?.dateFrom || getTodayDateString();
      const [entries, paymentBreakdown, cashCount] = await Promise.all([
        fetchSalesEntries(params ?? {}),
        fetchPaymentBreakdown(params ?? {}),
        getDailyCashCount(selectedCashDate)
      ]);
      setEntriesRows(entries);
      setPaymentRows(paymentBreakdown.rows);
      setPaymentTotal(paymentBreakdown.total);
      setCashCountData(cashCount);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Failed to load sales report.';
      setEntriesRows([]);
      setPaymentRows([]);
      setPaymentTotal(0);
      setCashCountData(null);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReport({});
  }, []);

  const packageSalesRows = useMemo<SummaryRow[]>(() => {
    const grouped = new Map<string, { qty: number; amount: number }>();

    entriesRows.forEach((entry) => {
      const packageName = entry.package_type || 'Unknown';
      const current = grouped.get(packageName) ?? { qty: 0, amount: 0 };
      current.qty += toNumber(entry.quantity);
      current.amount += toNumber(entry.total_sales);
      grouped.set(packageName, current);
    });

    return Array.from(grouped.entries())
      .map(([packageName, totals]) => ({
        packageName,
        qty: totals.qty,
        amount: totals.amount,
        price: totals.qty > 0 ? totals.amount / totals.qty : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [entriesRows]);

  const grandTotal = useMemo(
    () => entriesRows.reduce((sum, row) => sum + toNumber(row.total_sales), 0),
    [entriesRows]
  );

  const reportDateLabel = useMemo(() => {
    if (dateFrom && dateTo) {
      return `${formatDateLabel(dateFrom)} - ${formatDateLabel(dateTo)}`;
    }
    if (dateFrom) {
      return formatDateLabel(dateFrom);
    }
    if (dateTo) {
      return formatDateLabel(dateTo);
    }
    return formatDateLabel(getTodayDateString());
  }, [dateFrom, dateTo]);

  const mobileStockistPackageRows = useMemo(
    () =>
      packageSalesRows.filter((row) => row.packageName.toLowerCase().includes('mobile stockist')),
    [packageSalesRows]
  );

  const depotPackageRows = useMemo(
    () => packageSalesRows.filter((row) => row.packageName.toLowerCase().includes('depot')),
    [packageSalesRows]
  );

  const cashLines = cashCountData?.lines ?? [];
  const totalCashOnHand = cashCountData?.header.total_cash ?? 0;

  const bankRows = useMemo<ReferenceRow[]>(
    () =>
      paymentRows
        .filter((row) => modeIncludes(row.mode, ['bank']))
        .map((row) => ({
          label: 'Security Bank',
          reference: '-',
          amount: row.amount
        })),
    [paymentRows]
  );

  const mayaIgiRows = useMemo<ReferenceRow[]>(
    () =>
      paymentRows
        .filter((row) => modeIncludes(row.mode, ['maya', 'igi']) || row.mode.toLowerCase() === 'maya')
        .map((row) => ({
          label: 'Maya',
          reference: '-',
          amount: row.amount
        })),
    [paymentRows]
  );

  const sbCollectIgiRows = useMemo<ReferenceRow[]>(
    () =>
      paymentRows
        .filter((row) => modeIncludes(row.mode, ['sb collect', 'igi']))
        .map((row) => ({
          label: row.mode,
          reference: '-',
          amount: row.amount
        })),
    [paymentRows]
  );

  const sbCollectAtcRows = useMemo<ReferenceRow[]>(
    () =>
      paymentRows
        .filter((row) => modeIncludes(row.mode, ['sb collect', 'atc']))
        .map((row) => ({
          label: row.mode,
          reference: '-',
          amount: row.amount
        })),
    [paymentRows]
  );

  const arCsaRows = useMemo<ReferenceRow[]>(
    () =>
      paymentRows
        .filter((row) => modeIncludes(row.mode, ['ar', 'csa']))
        .map((row) => ({
          label: '-',
          reference: '-',
          amount: row.amount
        })),
    [paymentRows]
  );

  const newAccounts = { silver: 0, gold: 0, platinum: 0 };
  const upgrades = { silver: 0, gold: 0, platinum: 0 };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6 erp-title-primary">Sales Report</h1>

      <section className="bg-white border border-gray-200 rounded-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Date From" type="date" value={dateFrom} onChange={setDateFrom} />
          <FormField label="Date To" type="date" value={dateTo} onChange={setDateTo} />
          <div className="self-end">
            <button
              type="button"
              className="erp-btn-primary w-full"
              onClick={() =>
                void loadReport({
                  dateFrom: dateFrom || undefined,
                  dateTo: dateTo || undefined,
                  search: searchText || undefined
                })
              }
            >
              Generate Report
            </button>
          </div>
        </div>

        <div className="mt-4 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            className="w-full border border-gray-300 py-2 pl-9 pr-3 text-sm"
            placeholder="Search table..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        {!loading && !error && entriesRows.length === 0 ? (
          <p className="mt-3 text-sm text-gray-600">No records found for selected date range.</p>
        ) : null}
      </section>

      <div id="sales-report-print" className="mx-auto bg-white w-full max-w-[980px] border border-gray-300 p-4 text-[11px] leading-tight">
        <div className="text-center mb-3">
          <p className="font-semibold">Company Name</p>
          <p className="font-semibold">Daily Sales Report</p>
          <p>{reportDateLabel}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-3">
            <Box title="Package Sales Summary">
              <SummaryTable firstHeader="PACKAGE" rows={packageSalesRows} loading={loading} totalLabel="TOTAL" />
            </Box>

            <Box title="Mobile Stockist Package">
              <SummaryTable
                firstHeader="PACKAGE"
                rows={mobileStockistPackageRows}
                loading={loading}
                totalLabel="TOTAL"
              />
            </Box>

            <Box title="Depot Package">
              <SummaryTable firstHeader="PACKAGE" rows={depotPackageRows} loading={loading} totalLabel="TOTAL" />
            </Box>

            <Box title="Retail">
              <SummaryTable firstHeader="ITEM" rows={[]} loading={false} totalLabel="TOTAL RETAIL SALES" />
            </Box>

            <Box title="Mobile Stockist Detail">
              <SummaryTable firstHeader="ITEM" rows={[]} loading={false} totalLabel="TOTAL" />
            </Box>

            <Box title="Depot Retail">
              <SummaryTable firstHeader="ITEM" rows={[]} loading={false} totalLabel="TOTAL" />
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
                  {loading ? (
                    <tr>
                      <td colSpan={3} className={`${tableCellClassName} text-center`}>
                        Loading...
                      </td>
                    </tr>
                  ) : null}
                  {!loading && cashLines.length === 0 ? (
                    <tr>
                      <td colSpan={3} className={`${tableCellClassName} text-center`}>
                        No records
                      </td>
                    </tr>
                  ) : null}
                  {!loading
                    ? cashLines.map((line, index) => (
                        <tr key={`${line.denomination}-${index}`}>
                          <td className={tableCellClassName}>{line.denomination}</td>
                          <td className={numberCellClassName}>{line.pieces}</td>
                          <td className={numberCellClassName}>{currencyFormatter.format(line.amount)}</td>
                        </tr>
                      ))
                    : null}
                  <tr>
                    <td colSpan={2} className={tableCellClassName}>
                      Total Cash on Hand
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
                  {loading ? (
                    <tr>
                      <td colSpan={2} className={`${tableCellClassName} text-center`}>
                        Loading...
                      </td>
                    </tr>
                  ) : null}
                  {!loading && paymentRows.length === 0 ? (
                    <tr>
                      <td colSpan={2} className={`${tableCellClassName} text-center`}>
                        No records
                      </td>
                    </tr>
                  ) : null}
                  {!loading
                    ? paymentRows.map((row) => (
                        <tr key={row.mode}>
                          <td className={tableCellClassName}>{row.mode}</td>
                          <td className={numberCellClassName}>{currencyFormatter.format(row.amount)}</td>
                        </tr>
                      ))
                    : null}
                  <tr>
                    <td className={tableCellClassName}>TOTAL</td>
                    <td className={numberCellClassName}>{currencyFormatter.format(paymentTotal)}</td>
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

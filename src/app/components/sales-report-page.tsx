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

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP'
});

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

  const packageTotalQty = useMemo(
    () => packageSalesRows.reduce((sum, row) => sum + row.qty, 0),
    [packageSalesRows]
  );
  const packageTotalAmount = useMemo(
    () => packageSalesRows.reduce((sum, row) => sum + row.amount, 0),
    [packageSalesRows]
  );
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

  const cashLines = cashCountData?.lines ?? [];
  const totalCashOnHand = cashCountData?.header.total_cash ?? 0;

  const tableClassName = 'w-full text-xs border border-gray-400 border-collapse';
  const headerCellClassName = 'border border-gray-300 px-2 py-1 text-left font-semibold';
  const bodyCellClassName = 'border border-gray-300 px-2 py-1';
  const numericCellClassName = `${bodyCellClassName} text-right`;

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
            className="w-full border border-gray-300 rounded-md py-2 pl-9 pr-3 text-sm"
            placeholder="Search table..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        {!loading && !error && entriesRows.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">No records found for selected date range.</p>
        ) : null}
      </section>

      <div id="sales-report-print" className="bg-white mx-auto w-full max-w-[900px] p-6 border border-gray-200">
        <header className="text-center mb-6">
          <p className="font-bold text-base">Company Name</p>
          <p className="font-semibold text-lg">Daily Sales Report</p>
          <p className="text-sm text-gray-700">{reportDateLabel}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-semibold mb-2 uppercase">Package Sales Summary</h2>
            <div className="overflow-x-auto">
              <table className={tableClassName}>
                <thead className="bg-gray-100">
                  <tr>
                    <th className={headerCellClassName}>PACKAGE</th>
                    <th className={`${headerCellClassName} text-right`}>QTY</th>
                    <th className={`${headerCellClassName} text-right`}>PRICE</th>
                    <th className={`${headerCellClassName} text-right`}>AMOUNT TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className={`${bodyCellClassName} text-center`}>
                        Loading...
                      </td>
                    </tr>
                  ) : null}
                  {!loading && packageSalesRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={`${bodyCellClassName} text-center`}>
                        No records
                      </td>
                    </tr>
                  ) : null}
                  {!loading
                    ? packageSalesRows.map((row) => (
                        <tr key={row.packageName}>
                          <td className={bodyCellClassName}>{row.packageName}</td>
                          <td className={numericCellClassName}>{row.qty}</td>
                          <td className={numericCellClassName}>{currencyFormatter.format(row.price)}</td>
                          <td className={numericCellClassName}>{currencyFormatter.format(row.amount)}</td>
                        </tr>
                      ))
                    : null}
                  <tr className="font-semibold bg-gray-50">
                    <td className={bodyCellClassName}>Total</td>
                    <td className={numericCellClassName}>{packageTotalQty}</td>
                    <td className={numericCellClassName}>-</td>
                    <td className={numericCellClassName}>{currencyFormatter.format(packageTotalAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-sm font-semibold mt-4 mb-2 uppercase">Retail</h2>
            <div className="overflow-x-auto">
              <table className={tableClassName}>
                <thead className="bg-gray-100">
                  <tr>
                    <th className={headerCellClassName}>ITEM</th>
                    <th className={`${headerCellClassName} text-right`}>QTY</th>
                    <th className={`${headerCellClassName} text-right`}>PRICE</th>
                    <th className={`${headerCellClassName} text-right`}>AMOUNT TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={4} className={`${bodyCellClassName} text-center`}>
                      No records
                    </td>
                  </tr>
                  <tr className="font-semibold bg-gray-50">
                    <td colSpan={3} className={bodyCellClassName}>
                      Total Retail Sales
                    </td>
                    <td className={numericCellClassName}>{currencyFormatter.format(0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className={tableClassName}>
                <tbody>
                  <tr className="font-semibold bg-gray-100">
                    <td className={bodyCellClassName}>GRAND TOTAL</td>
                    <td className={numericCellClassName}>{currencyFormatter.format(grandTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold mb-2 uppercase">Cash on Hand</h2>
            <div className="overflow-x-auto">
              <table className={tableClassName}>
                <thead className="bg-gray-100">
                  <tr>
                    <th className={headerCellClassName}>Denomination</th>
                    <th className={`${headerCellClassName} text-right`}>Pieces</th>
                    <th className={`${headerCellClassName} text-right`}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={3} className={`${bodyCellClassName} text-center`}>
                        Loading...
                      </td>
                    </tr>
                  ) : null}
                  {!loading && cashLines.length === 0 ? (
                    <tr>
                      <td colSpan={3} className={`${bodyCellClassName} text-center`}>
                        No records
                      </td>
                    </tr>
                  ) : null}
                  {!loading
                    ? cashLines.map((line, index) => (
                        <tr key={`${line.denomination}-${index}`}>
                          <td className={bodyCellClassName}>{line.denomination}</td>
                          <td className={numericCellClassName}>{line.pieces}</td>
                          <td className={numericCellClassName}>{currencyFormatter.format(line.amount)}</td>
                        </tr>
                      ))
                    : null}
                </tbody>
                <tfoot>
                  <tr className="font-semibold bg-gray-50">
                    <td colSpan={2} className={bodyCellClassName}>
                      Total Cash on Hand
                    </td>
                    <td className={numericCellClassName}>{currencyFormatter.format(totalCashOnHand)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <h2 className="text-sm font-semibold mt-4 mb-2 uppercase">Payment Breakdown</h2>
            <div className="overflow-x-auto">
              <table className={tableClassName}>
                <thead className="bg-gray-100">
                  <tr>
                    <th className={headerCellClassName}>Payment Method</th>
                    <th className={`${headerCellClassName} text-right`}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={2} className={`${bodyCellClassName} text-center`}>
                        Loading...
                      </td>
                    </tr>
                  ) : null}
                  {!loading && paymentRows.length === 0 ? (
                    <tr>
                      <td colSpan={2} className={`${bodyCellClassName} text-center`}>
                        No records
                      </td>
                    </tr>
                  ) : null}
                  {!loading
                    ? paymentRows.map((row) => (
                        <tr key={row.mode}>
                          <td className={bodyCellClassName}>{row.mode}</td>
                          <td className={numericCellClassName}>{currencyFormatter.format(row.amount)}</td>
                        </tr>
                      ))
                    : null}
                </tbody>
                <tfoot>
                  <tr className="font-semibold bg-gray-50">
                    <td className={bodyCellClassName}>TOTAL</td>
                    <td className={numericCellClassName}>{currencyFormatter.format(paymentTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2 uppercase">Bank</h3>
              <div className="overflow-x-auto">
                <table className={tableClassName}>
                  <thead className="bg-gray-100">
                    <tr>
                      <th className={headerCellClassName}>Bank</th>
                      <th className={headerCellClassName}>Reference #</th>
                      <th className={`${headerCellClassName} text-right`}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={3} className={`${bodyCellClassName} text-center`}>
                        No records
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 uppercase">SB Collect (IGI)</h3>
              <div className="overflow-x-auto">
                <table className={tableClassName}>
                  <thead className="bg-gray-100">
                    <tr>
                      <th className={headerCellClassName}>POF/Ref#</th>
                      <th className={headerCellClassName}>Reference #</th>
                      <th className={`${headerCellClassName} text-right`}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={3} className={`${bodyCellClassName} text-center`}>
                        No records
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 uppercase">AR CSA</h3>
              <div className="overflow-x-auto">
                <table className={tableClassName}>
                  <thead className="bg-gray-100">
                    <tr>
                      <th className={headerCellClassName}>Name</th>
                      <th className={headerCellClassName}>POF #</th>
                      <th className={`${headerCellClassName} text-right`}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={3} className={`${bodyCellClassName} text-center`}>
                        No records
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2 uppercase">Maya (IGI)</h3>
              <div className="overflow-x-auto">
                <table className={tableClassName}>
                  <thead className="bg-gray-100">
                    <tr>
                      <th className={headerCellClassName}>POF/Ref#</th>
                      <th className={headerCellClassName}>Reference #</th>
                      <th className={`${headerCellClassName} text-right`}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={3} className={`${bodyCellClassName} text-center`}>
                        No records
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 uppercase">SB Collect (ATC)</h3>
              <div className="overflow-x-auto">
                <table className={tableClassName}>
                  <thead className="bg-gray-100">
                    <tr>
                      <th className={headerCellClassName}>POF/Ref#</th>
                      <th className={headerCellClassName}>Reference #</th>
                      <th className={`${headerCellClassName} text-right`}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={3} className={`${bodyCellClassName} text-center`}>
                        No records
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 uppercase">AR (Leader Support)</h3>
              <div className="overflow-x-auto">
                <table className={tableClassName}>
                  <thead className="bg-gray-100">
                    <tr>
                      <th className={headerCellClassName}>Name</th>
                      <th className={headerCellClassName}>POF #</th>
                      <th className={`${headerCellClassName} text-right`}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={3} className={`${bodyCellClassName} text-center`}>
                        No records
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mt-10 pt-6 border-t border-gray-300 text-sm">
          <div>
            <p className="mb-12">Prepared By:</p>
            <div className="border-t border-gray-400 pt-1 text-center">Name / Signature</div>
          </div>
          <div>
            <p className="mb-12">Checked By:</p>
            <div className="border-t border-gray-400 pt-1 text-center">Name / Signature</div>
          </div>
        </div>
      </div>
    </div>
  );
}

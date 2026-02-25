import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { FormField } from './form-field';
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

export function SalesReportPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchText, setSearchText] = useState('');
  const [entriesRows, setEntriesRows] = useState<SalesEntryRecord[]>([]);
  const [paymentRows, setPaymentRows] = useState<PaymentBreakdownRow[]>([]);
  const [paymentTotal, setPaymentTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReport = async (params?: { dateFrom?: string; dateTo?: string; search?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const [entries, paymentBreakdown] = await Promise.all([
        fetchSalesEntries(params ?? {}),
        fetchPaymentBreakdown(params ?? {})
      ]);
      setEntriesRows(entries);
      setPaymentRows(paymentBreakdown.rows);
      setPaymentTotal(paymentBreakdown.total);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Failed to load sales report.';
      setEntriesRows([]);
      setPaymentRows([]);
      setPaymentTotal(0);
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

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6 erp-title-primary">Sales Report</h1>

      <section className="erp-card p-6 mb-6">
        <div className="erp-grid-filters">
          <FormField label="Date From" type="date" value={dateFrom} onChange={setDateFrom} />
          <FormField label="Date To" type="date" value={dateTo} onChange={setDateTo} />
          <div style={{ alignSelf: 'end' }}>
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
          <Search
            className="w-4 h-4"
            style={{ position: 'absolute', top: 14, left: 12, color: '#6B7280' }}
          />
          <input
            type="text"
            className="erp-input"
            placeholder="Search table..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>

        {error ? (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        ) : null}
        {!loading && !error && entriesRows.length === 0 ? (
          <p className="mt-3 text-sm" style={{ color: '#6B7280' }}>
            No records found for selected date range.
          </p>
        ) : null}
      </section>

      <section className="erp-grid-report">
        <div>
          <div className="erp-card p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 erp-title-primary">Package Sales Summary</h2>
            <div className="overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Package</th>
                    <th className="num">Qty</th>
                    <th className="num">Price</th>
                    <th className="num">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : null}
                  {!loading && packageSalesRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center">
                        No data yet
                      </td>
                    </tr>
                  ) : null}
                  {!loading
                    ? packageSalesRows.map((row) => (
                        <tr key={row.packageName}>
                          <td>{row.packageName}</td>
                          <td className="num">{row.qty}</td>
                          <td className="num">{currencyFormatter.format(row.price)}</td>
                          <td className="num">{currencyFormatter.format(row.amount)}</td>
                        </tr>
                      ))
                    : null}
                  <tr className="erp-border-top-strong" style={{ background: '#F0F4FF' }}>
                    <td className="font-semibold">Total</td>
                    <td className="num font-semibold">{packageTotalQty}</td>
                    <td />
                    <td className="num font-semibold">{currencyFormatter.format(packageTotalAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="erp-card p-6">
            <h2 className="text-lg font-semibold mb-4 erp-title-primary">Retail Sales</h2>
            <p style={{ color: '#6B7280' }}>Retail Sales: No data connected yet</p>

            <div
              className="mt-4 p-4 rounded-lg flex items-center justify-between"
              style={{ background: '#2E3A8C', color: '#FFFFFF' }}
            >
              <span className="text-lg font-semibold">GRAND TOTAL</span>
              <span className="text-2xl font-semibold">{currencyFormatter.format(grandTotal)}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="erp-card p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 erp-title-primary">Cash Count Table</h2>
            <p style={{ color: '#6B7280' }}>Cash Count: Manual section (not connected)</p>
          </div>

          <div className="erp-card p-6">
            <h2 className="text-lg font-semibold mb-4 erp-title-primary">Payment Breakdown</h2>
            {loading ? <p style={{ color: '#6B7280' }}>Loading...</p> : null}
            {!loading && paymentRows.length === 0 ? (
              <p style={{ color: '#6B7280' }}>No data yet</p>
            ) : null}
            {!loading
              ? paymentRows.map((row) => (
                  <div
                    key={row.mode}
                    className="flex items-center justify-between py-2"
                    style={{ borderBottom: '1px solid #E5E7EB' }}
                  >
                    <span>{row.mode}</span>
                    <span>{currencyFormatter.format(row.amount)}</span>
                  </div>
                ))
              : null}
            <div
              className="flex items-center justify-between pt-3 mt-2 erp-border-top-strong"
              style={{ color: '#2E3A8C' }}
            >
              <span className="font-semibold">Total</span>
              <span className="font-semibold">{currencyFormatter.format(paymentTotal)}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

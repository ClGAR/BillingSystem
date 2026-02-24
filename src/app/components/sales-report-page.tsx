import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { FormField } from './form-field';

type SummaryRow = {
  packageName: string;
  qty: number;
  price: number;
  amount: number;
};

type RetailRow = {
  item: string;
  qty: number;
  price: number;
  amount: number;
};

const packageSalesRows: SummaryRow[] = [
  { packageName: 'Mobile Stockist', qty: 5, price: 45000, amount: 225000 },
  { packageName: 'Platinum', qty: 8, price: 25000, amount: 200000 },
  { packageName: 'Gold', qty: 12, price: 15000, amount: 180000 },
  { packageName: 'Silver', qty: 15, price: 8000, amount: 120000 }
];

const retailRows: RetailRow[] = [
  { item: 'Synbiotic (Bottle)', qty: 25, price: 1200, amount: 30000 },
  { item: 'Synbiotic (Blister)', qty: 40, price: 600, amount: 24000 },
  { item: 'Employee Discount', qty: 10, price: 1000, amount: 10000 }
];

const cashCounts = [
  { denomination: 1000, pieces: 12 },
  { denomination: 500, pieces: 18 },
  { denomination: 200, pieces: 20 },
  { denomination: 100, pieces: 22 },
  { denomination: 50, pieces: 28 },
  { denomination: 20, pieces: 40 },
  { denomination: 10, pieces: 55 },
  { denomination: 5, pieces: 70 },
  { denomination: 1, pieces: 120 },
  { denomination: 0.25, pieces: 200 }
];

const paymentBreakdown = [
  { method: 'Cash', amount: 120000 },
  { method: 'E-Wallet', amount: 75000 },
  { method: 'Bank Transfer', amount: 95000 },
  { method: 'Maya', amount: 30000 },
  { method: 'SP Collect', amount: 45000 },
  { method: 'Account Receivable', amount: 18000 },
  { method: 'Consignment', amount: 16000 },
  { method: 'Cheque', amount: 22500 },
  { method: 'E-Points', amount: 9000 }
];

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP'
});

export function SalesReportPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchText, setSearchText] = useState('');

  const packageTotal = useMemo(
    () => packageSalesRows.reduce((sum, row) => sum + row.amount, 0),
    []
  );
  const retailTotal = useMemo(() => retailRows.reduce((sum, row) => sum + row.amount, 0), []);
  const grandTotal = packageTotal + retailTotal;

  const cashRows = useMemo(
    () =>
      cashCounts.map((row) => ({
        ...row,
        amount: row.denomination * row.pieces
      })),
    []
  );
  const totalCash = useMemo(() => cashRows.reduce((sum, row) => sum + row.amount, 0), [cashRows]);
  const paymentTotal = useMemo(
    () => paymentBreakdown.reduce((sum, row) => sum + row.amount, 0),
    []
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6 erp-title-primary">Sales Report</h1>

      <section className="erp-card p-6 mb-6">
        <div className="erp-grid-filters">
          <FormField label="Date From" type="date" value={dateFrom} onChange={setDateFrom} />
          <FormField label="Date To" type="date" value={dateTo} onChange={setDateTo} />
          <div style={{ alignSelf: 'end' }}>
            <button type="button" className="erp-btn-primary w-full">
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
                  {packageSalesRows.map((row) => (
                    <tr key={row.packageName}>
                      <td>{row.packageName}</td>
                      <td className="num">{row.qty}</td>
                      <td className="num">{currencyFormatter.format(row.price)}</td>
                      <td className="num">{currencyFormatter.format(row.amount)}</td>
                    </tr>
                  ))}
                  <tr className="erp-border-top-strong" style={{ background: '#F0F4FF' }}>
                    <td className="font-semibold">Total</td>
                    <td className="num font-semibold">
                      {packageSalesRows.reduce((sum, row) => sum + row.qty, 0)}
                    </td>
                    <td />
                    <td className="num font-semibold">{currencyFormatter.format(packageTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="erp-card p-6">
            <h2 className="text-lg font-semibold mb-4 erp-title-primary">Retail Sales</h2>
            <div className="overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th className="num">Qty</th>
                    <th className="num">Price</th>
                    <th className="num">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {retailRows.map((row) => (
                    <tr key={row.item}>
                      <td>{row.item}</td>
                      <td className="num">{row.qty}</td>
                      <td className="num">{currencyFormatter.format(row.price)}</td>
                      <td className="num">{currencyFormatter.format(row.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
            <div className="overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Denomination</th>
                    <th className="num">Pieces</th>
                    <th className="num">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {cashRows.map((row) => (
                    <tr key={row.denomination}>
                      <td>{row.denomination}</td>
                      <td className="num">{row.pieces}</td>
                      <td className="num">{currencyFormatter.format(row.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="erp-surface-soft p-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="font-medium erp-title-primary">Total Cash on Hand</span>
                <span className="text-lg font-semibold erp-title-primary">
                  {currencyFormatter.format(totalCash)}
                </span>
              </div>
            </div>
          </div>

          <div className="erp-card p-6">
            <h2 className="text-lg font-semibold mb-4 erp-title-primary">Payment Breakdown</h2>
            {paymentBreakdown.map((row) => (
              <div
                key={row.method}
                className="flex items-center justify-between py-2"
                style={{ borderBottom: '1px solid #E5E7EB' }}
              >
                <span>{row.method}</span>
                <span>{currencyFormatter.format(row.amount)}</span>
              </div>
            ))}
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

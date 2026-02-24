import React, { useMemo } from 'react';
import { Printer } from 'lucide-react';

type InventoryRow = {
  name: string;
  ggTransNo: string;
  pofNumber: string;
  packagePlat: number;
  packageGold: number;
  packageSilver: number;
  retailBottle: number;
  retailBlister: number;
  retailVoucher: number;
  retailDisc: number;
  bottles: number;
  blisters: number;
  releasedBottle: number;
  releasedBlister: number;
  toFollowBottle: number;
  toFollowBlister: number;
  amount: number;
};

const rows: InventoryRow[] = [
  {
    name: 'Juan Dela Cruz',
    ggTransNo: 'GG-2024-001',
    pofNumber: 'POF-12345',
    packagePlat: 1,
    packageGold: 0,
    packageSilver: 0,
    retailBottle: 2,
    retailBlister: 5,
    retailVoucher: 0,
    retailDisc: 0,
    bottles: 15,
    blisters: 30,
    releasedBottle: 10,
    releasedBlister: 20,
    toFollowBottle: 5,
    toFollowBlister: 10,
    amount: 125000
  },
  {
    name: 'Maria Santos',
    ggTransNo: 'GG-2024-002',
    pofNumber: 'POF-12346',
    packagePlat: 0,
    packageGold: 1,
    packageSilver: 0,
    retailBottle: 1,
    retailBlister: 8,
    retailVoucher: 1,
    retailDisc: 0,
    bottles: 10,
    blisters: 25,
    releasedBottle: 8,
    releasedBlister: 18,
    toFollowBottle: 2,
    toFollowBlister: 7,
    amount: 98000
  },
  {
    name: 'Pedro Reyes',
    ggTransNo: 'GG-2024-003',
    pofNumber: 'POF-12347',
    packagePlat: 0,
    packageGold: 0,
    packageSilver: 1,
    retailBottle: 3,
    retailBlister: 4,
    retailVoucher: 0,
    retailDisc: 1,
    bottles: 12,
    blisters: 20,
    releasedBottle: 9,
    releasedBlister: 15,
    toFollowBottle: 3,
    toFollowBlister: 5,
    amount: 78000
  },
  {
    name: 'Ana Villanueva',
    ggTransNo: 'GG-2024-004',
    pofNumber: 'POF-12348',
    packagePlat: 1,
    packageGold: 0,
    packageSilver: 0,
    retailBottle: 2,
    retailBlister: 6,
    retailVoucher: 1,
    retailDisc: 0,
    bottles: 16,
    blisters: 28,
    releasedBottle: 11,
    releasedBlister: 22,
    toFollowBottle: 5,
    toFollowBlister: 6,
    amount: 132000
  },
  {
    name: 'Carlos Lim',
    ggTransNo: 'GG-2024-005',
    pofNumber: 'POF-12349',
    packagePlat: 0,
    packageGold: 1,
    packageSilver: 1,
    retailBottle: 4,
    retailBlister: 7,
    retailVoucher: 0,
    retailDisc: 0,
    bottles: 18,
    blisters: 34,
    releasedBottle: 12,
    releasedBlister: 24,
    toFollowBottle: 6,
    toFollowBlister: 10,
    amount: 156000
  }
];

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP'
});

export function InventoryReportPage() {
  const totalAmount = useMemo(() => rows.reduce((sum, row) => sum + row.amount, 0), []);
  const reportDate = new Date().toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold erp-title-primary">Inventory Report</h1>
        <button
          type="button"
          className="erp-btn-primary print:hidden erp-print-hidden"
          onClick={() => window.print()}
        >
          <Printer className="w-4 h-4 mr-2" />
          Print
        </button>
      </div>

      <div className="erp-card p-8">
        <div className="text-center pb-4 mb-6" style={{ borderBottom: '2px solid #2E3A8C' }}>
          <h2 className="text-2xl font-semibold erp-title-primary">Company Name</h2>
          <p className="text-xl mt-1" style={{ color: '#374151' }}>
            Inventory Report
          </p>
          <p className="text-sm mt-2" style={{ color: '#374151' }}>
            Report Date: {reportDate}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="erp-table erp-inv-table text-sm" style={{ minWidth: 1400 }}>
            <thead>
              <tr>
                <th rowSpan={2}>Name</th>
                <th rowSpan={2}>GG Trans No</th>
                <th rowSpan={2}>POF Number</th>
                <th colSpan={3} className="erp-border-left">
                  Package Type
                </th>
                <th colSpan={4} className="erp-border-left">
                  Retail Items
                </th>
                <th rowSpan={2} className="erp-border-left">
                  Bottles
                </th>
                <th rowSpan={2}>Blisters</th>
                <th colSpan={2} className="erp-border-left">
                  Released
                </th>
                <th colSpan={2} className="erp-border-left">
                  To Follow
                </th>
                <th rowSpan={2} className="erp-border-left">
                  Amount
                </th>
              </tr>
              <tr>
                <th className="erp-border-left">Plat</th>
                <th>Gold</th>
                <th>Silver</th>
                <th className="erp-border-left">Bottle</th>
                <th>Blister</th>
                <th>Voucher</th>
                <th>Disc.</th>
                <th className="erp-border-left">Bottle</th>
                <th>Blister</th>
                <th className="erp-border-left">Bottle</th>
                <th>Blister</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.ggTransNo}>
                  <td>{row.name}</td>
                  <td>{row.ggTransNo}</td>
                  <td>{row.pofNumber}</td>
                  <td className="erp-border-left">{row.packagePlat}</td>
                  <td>{row.packageGold}</td>
                  <td>{row.packageSilver}</td>
                  <td className="erp-border-left">{row.retailBottle}</td>
                  <td>{row.retailBlister}</td>
                  <td>{row.retailVoucher}</td>
                  <td>{row.retailDisc}</td>
                  <td className="erp-border-left">{row.bottles}</td>
                  <td>{row.blisters}</td>
                  <td className="erp-border-left">{row.releasedBottle}</td>
                  <td>{row.releasedBlister}</td>
                  <td className="erp-border-left">{row.toFollowBottle}</td>
                  <td>{row.toFollowBlister}</td>
                  <td className="erp-border-left num">{currencyFormatter.format(row.amount)}</td>
                </tr>
              ))}
              <tr className="erp-border-top-strong" style={{ background: '#F0F4FF' }}>
                <td colSpan={16} className="text-right font-semibold">
                  Total Amount:
                </td>
                <td className="num font-semibold">{currencyFormatter.format(totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="erp-sign-grid mt-12 pt-8" style={{ borderTop: '1px solid #D0D5DD' }}>
          <div>
            <p className="mb-10 font-medium">Prepared By:</p>
            <div style={{ borderTop: '1px solid #374151', maxWidth: 260, paddingTop: 8 }}>
              <p className="text-center text-sm">Name &amp; Signature</p>
            </div>
          </div>
          <div>
            <p className="mb-10 font-medium">Checked By:</p>
            <div style={{ borderTop: '1px solid #374151', maxWidth: 260, paddingTop: 8 }}>
              <p className="text-center text-sm">Name &amp; Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { Printer } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { type InventoryReportRecord } from '../../services/inventoryReport.service';

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

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP'
});

function toNumber(value: number | string | null | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapInventoryRecordToRow(record: InventoryReportRecord): InventoryRow {
  const saleEntryId = record.sale_entry_id != null ? String(record.sale_entry_id) : '';
  const packageType = (record.package_type ?? '').toLowerCase();
  const quantity = toNumber(record.quantity);
  const blisterCount = toNumber(record.blister_count);
  const releasedBottle = toNumber(record.released_bottle);
  const releasedBlister = toNumber(record.released_blister);
  const toFollowBottle = toNumber(record.to_follow_bottle);
  const toFollowBlister = toNumber(record.to_follow_blister);
  const isPlatinum = packageType.includes('plat');
  const isGold = packageType.includes('gold');
  const isSilver = packageType.includes('silver');
  const isPackageRow = isPlatinum || isGold || isSilver;

  return {
    name: record.member_name || '—',
    ggTransNo: saleEntryId ? saleEntryId.slice(0, 8) : '—',
    pofNumber: record.po_number || '—',
    packagePlat: isPlatinum ? quantity : 0,
    packageGold: isGold ? quantity : 0,
    packageSilver: isSilver ? quantity : 0,
    retailBottle: isPackageRow ? 0 : quantity,
    retailBlister: isPackageRow ? 0 : blisterCount,
    retailVoucher: 0,
    retailDisc: 0,
    bottles: releasedBottle + toFollowBottle,
    blisters: releasedBlister + toFollowBlister,
    releasedBottle,
    releasedBlister,
    toFollowBottle,
    toFollowBlister,
    amount: toNumber(record.total_sales)
  };
}

export function InventoryReportPage() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    let isMounted = true;

    async function loadRows() {
      try {
        setLoading(true);
        setError(null);
        const { data, error: queryError } = await supabase
          .from('v_inventory_report')
          .select('*')
          .eq('sale_date', reportDate)
          .order('created_at', { ascending: true });

        if (queryError) {
          throw new Error(queryError.message || 'Failed to fetch inventory report.');
        }

        if (!isMounted) {
          return;
        }
        setRows(((data ?? []) as InventoryReportRecord[]).map(mapInventoryRecordToRow));
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }
        const message =
          fetchError instanceof Error ? fetchError.message : 'Failed to load inventory report.';
        setRows([]);
        setError(message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadRows();

    return () => {
      isMounted = false;
    };
  }, [reportDate]);

  const totalAmount = useMemo(() => rows.reduce((sum, row) => sum + row.amount, 0), [rows]);
  const reportDateDisplay = new Date(reportDate).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold erp-title-primary">Inventory Report</h1>
        <div className="flex items-end gap-3 print:hidden erp-print-hidden">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Report Date</label>
            <input
              type="date"
              value={reportDate}
              onChange={(event) => setReportDate(event.target.value)}
              className="h-11 px-3 border border-gray-300 rounded-md"
            />
          </div>
          <button type="button" className="erp-btn-primary" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>
        </div>
      </div>

      <div className="erp-card p-8">
        <div className="text-center pb-4 mb-6" style={{ borderBottom: '2px solid #2E3A8C' }}>
          <h2 className="text-2xl font-semibold erp-title-primary">Company Name</h2>
          <p className="text-xl mt-1" style={{ color: '#374151' }}>
            Inventory Report
          </p>
          <p className="text-sm mt-2" style={{ color: '#374151' }}>
            Report Date: {reportDateDisplay}
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
              {loading ? (
                <tr>
                  <td colSpan={17} className="text-center">
                    Loading...
                  </td>
                </tr>
              ) : null}
              {!loading && error ? (
                <tr>
                  <td colSpan={17} className="text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : null}
              {!loading && !error && rows.length === 0 ? (
                <tr>
                  <td colSpan={17} className="text-center">
                    No records for this date.
                  </td>
                </tr>
              ) : null}
              {!loading && !error
                ? rows.map((row, index) => (
                    <tr key={`${row.ggTransNo}-${row.pofNumber}-${index}`}>
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
                  ))
                : null}
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

import React, { useEffect, useState } from 'react';
import './styles.css';
import { Navigation, type DashboardPage } from './components/navigation';
import { EncoderPage } from './components/encoder-page';
import { SalesReportPage } from './components/sales-report-page';
import { InventoryReportPage } from './components/inventory-report-page';

type SalesDashboardEncoderAppProps = {
  initialPage?: DashboardPage;
};

function DashboardPageContent() {
  const cards = [
    { label: 'Today Sales', value: 'PHP 0.00' },
    { label: 'New Entries', value: '0' },
    { label: 'Inventory Alerts', value: '0' }
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6 erp-title-primary">Sales Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="erp-card p-6">
            <p className="text-sm mb-1" style={{ color: '#2E3A8C' }}>
              {card.label}
            </p>
            <p className="text-2xl font-semibold" style={{ color: '#111827' }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SalesDashboardEncoderApp({ initialPage = 'encoder' }: SalesDashboardEncoderAppProps) {
  const [activePage, setActivePage] = useState<DashboardPage>(initialPage);

  useEffect(() => {
    setActivePage(initialPage);
  }, [initialPage]);

  return (
    <div className="erp-root pt-16">
      <div className="erp-main">
        <Navigation activePage={activePage} onPageChange={setActivePage} />
        <div className="mt-6">
          {activePage === 'dashboard' && <DashboardPageContent />}
          {activePage === 'encoder' && <EncoderPage />}
          {activePage === 'sales-report' && <SalesReportPage />}
          {activePage === 'inventory-report' && <InventoryReportPage />}
        </div>
      </div>
    </div>
  );
}

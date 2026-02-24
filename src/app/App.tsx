import React, { useEffect, useState } from 'react';
import './styles.css';
import { Navigation, type DashboardPage } from './components/navigation';
import { SalesReportPage } from './components/sales-report-page';
import { InventoryReportPage } from './components/inventory-report-page';
import { SalesDashboardPage } from './components/sales-dashboard-page';

type SalesDashboardEncoderAppProps = {
  initialPage?: DashboardPage;
};

export function SalesDashboardEncoderApp({ initialPage = 'dashboard' }: SalesDashboardEncoderAppProps) {
  const [activePage, setActivePage] = useState<DashboardPage>(initialPage);

  useEffect(() => {
    setActivePage(initialPage);
  }, [initialPage]);

  return (
    <div className="erp-root pt-16">
      <div className="erp-main">
        <Navigation activePage={activePage} onPageChange={setActivePage} />
        <div className="mt-6">
          {activePage === 'dashboard' && <SalesDashboardPage />}
          {activePage === 'sales-report' && <SalesReportPage />}
          {activePage === 'inventory-report' && <InventoryReportPage />}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import './styles.css';
import { Navigation } from './components/navigation';
import { ModuleTabs, type ActivePage } from './components/module-tabs';
import { SalesReportPage } from './components/sales-report-page';
import { InventoryReportPage } from './components/inventory-report-page';
import { SalesDashboardPage } from './components/sales-dashboard-page';
import { EncoderPage } from './components/encoder-page';

type SalesDashboardEncoderAppProps = {
  initialPage?: ActivePage;
};

export function SalesDashboardEncoderApp({ initialPage = 'dashboard' }: SalesDashboardEncoderAppProps) {
  const [activePage, setActivePage] = useState<ActivePage>(initialPage);

  useEffect(() => {
    setActivePage(initialPage);
  }, [initialPage]);

  const renderPageContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <SalesDashboardPage />;
      case 'encoder':
        return <EncoderPage />;
      case 'reports':
        return (
          <div className="erp-card p-6">
            <h2 className="text-lg font-semibold erp-title-primary">Reports</h2>
            <p className="mt-2" style={{ color: '#6B7280' }}>
              Reports content will be added here.
            </p>
          </div>
        );
      case 'inventory-report':
        return <InventoryReportPage />;
      case 'sales-report':
        return <SalesReportPage />;
      case 'users':
        return <div className="erp-card p-6" />;
      case 'sales-metrics':
        return <div className="erp-card p-6" />;
      default:
        return null;
    }
  };

  return (
    <div className="erp-root pt-16">
      <div className="erp-main">
        <Navigation />
        <ModuleTabs activePage={activePage} setActivePage={setActivePage} />
        <div className="mt-6">{renderPageContent()}</div>
      </div>
    </div>
  );
}

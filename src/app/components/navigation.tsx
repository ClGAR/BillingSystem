import React from 'react';
import { Building2 } from 'lucide-react';

export type DashboardPage = 'dashboard' | 'encoder' | 'sales-report' | 'inventory-report';

type NavigationProps = {
  activePage: DashboardPage;
  onPageChange: (page: DashboardPage) => void;
};

type TabConfig = {
  label: string;
  page?: DashboardPage;
};

const tabs: TabConfig[] = [
  { label: 'Dashboard', page: 'dashboard' },
  { label: 'Encoder', page: 'encoder' },
  { label: 'Reports' },
  { label: 'Inventory Report', page: 'inventory-report' },
  { label: 'Sales Report', page: 'sales-report' },
  { label: 'Users' },
  { label: 'Sales Metrics' }
];

export function Navigation({ activePage, onPageChange }: NavigationProps) {
  return (
    <div className="erp-nav">
      <div className="flex items-center px-6">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: '#2E3A8C' }}
        >
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-semibold ml-3 erp-title-primary">Sales Dashboard &amp; Encoder</h1>
      </div>
      <div className="flex h-full">
        {tabs.map((tab) => {
          const isClickable = Boolean(tab.page);
          const isActive = tab.page === activePage;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => {
                if (tab.page) {
                  onPageChange(tab.page);
                }
              }}
              className="px-6 py-3 text-sm font-medium"
              style={{
                borderBottomWidth: 2,
                borderBottomStyle: 'solid',
                borderBottomColor: isActive ? '#2E3A8C' : 'transparent',
                background: isActive ? '#F9FAFB' : 'transparent',
                color: isActive ? '#2E3A8C' : '#6B7280',
                opacity: isClickable ? 1 : 0.6,
                cursor: isClickable ? 'pointer' : 'default'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

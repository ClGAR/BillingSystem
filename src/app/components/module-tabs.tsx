import React from 'react';

export type ActivePage =
  | 'dashboard'
  | 'encoder'
  | 'reports'
  | 'inventory-report'
  | 'sales-report'
  | 'users'
  | 'sales-metrics';

type ModuleTabsProps = {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
};

const tabs: Array<{ label: string; page: ActivePage }> = [
  { label: 'Dashboard', page: 'dashboard' },
  { label: 'Encoder', page: 'encoder' },
  { label: 'Reports', page: 'reports' },
  { label: 'Inventory Report', page: 'inventory-report' },
  { label: 'Sales Report', page: 'sales-report' },
  { label: 'Users', page: 'users' },
  { label: 'Sales Metrics', page: 'sales-metrics' }
];

export function ModuleTabs({ activePage, setActivePage }: ModuleTabsProps) {
  return (
    <div className="bg-transparent mt-4 overflow-x-auto">
      <div className="flex items-center gap-8 border-b border-[#E5E7EB] min-w-max">
        {tabs.map((tab) => {
          const isActive = tab.page === activePage;
          return (
            <button
              key={tab.page}
              type="button"
              onClick={() => setActivePage(tab.page)}
              className={`px-1 py-4 text-sm font-medium transition-colors border-b-2 ${
                isActive
                  ? 'text-[#2E3A8C] border-[#2E3A8C]'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

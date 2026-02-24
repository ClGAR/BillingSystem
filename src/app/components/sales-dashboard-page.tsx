import React, { useState } from 'react';
import { EncoderPage } from './encoder-page';

type DashboardTab = 'dashboard' | 'encoder' | 'reports';

export function SalesDashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');

  const cards = [
    { label: 'Today Sales', value: 'PHP 0.00' },
    { label: 'New Entries', value: '0' },
    { label: 'Inventory Alerts', value: '0' }
  ];

  const tabs: Array<{ key: DashboardTab; label: string }> = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'encoder', label: 'Encoder' },
    { key: 'reports', label: 'Reports' }
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold erp-title-primary mb-4">Sales Dashboard</h1>
      <div className="mb-6" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <div className="flex items-center">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className="px-4 py-3 text-sm font-medium"
                style={{
                  color: isActive ? '#2E3A8C' : '#6B7280',
                  borderBottomWidth: 2,
                  borderBottomStyle: 'solid',
                  borderBottomColor: isActive ? '#2E3A8C' : 'transparent'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'dashboard' ? (
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
      ) : null}

      {activeTab === 'encoder' ? <EncoderPage /> : null}

      {activeTab === 'reports' ? (
        <div className="erp-card p-6">
          <h2 className="text-lg font-semibold erp-title-primary">Reports</h2>
          <p className="mt-2" style={{ color: '#6B7280' }}>
            Reports content will be added here.
          </p>
        </div>
      ) : null}
    </div>
  );
}

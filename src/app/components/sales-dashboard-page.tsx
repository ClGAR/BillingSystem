import React, { useState } from 'react';
import { EncoderPage } from './encoder-page';

type DashboardSubview = 'dashboard-view' | 'encoder';

export function SalesDashboardPage() {
  const [activeSubview, setActiveSubview] = useState<DashboardSubview>('dashboard-view');

  const cards = [
    { label: 'Today Sales', value: 'PHP 0.00' },
    { label: 'New Entries', value: '0' },
    { label: 'Inventory Alerts', value: '0' }
  ];

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <h1 className="text-2xl font-semibold erp-title-primary">Sales Dashboard</h1>
        <div
          className="inline-flex rounded-full p-1"
          style={{ background: '#F3F4F6', border: '1px solid #D0D5DD' }}
        >
          <button
            type="button"
            onClick={() => setActiveSubview('dashboard-view')}
            className="px-4 py-2 rounded-full text-sm font-medium"
            style={{
              background: activeSubview === 'dashboard-view' ? '#2E3A8C' : 'transparent',
              color: activeSubview === 'dashboard-view' ? '#FFFFFF' : '#6B7280'
            }}
          >
            Dashboard View
          </button>
          <button
            type="button"
            onClick={() => setActiveSubview('encoder')}
            className="px-4 py-2 rounded-full text-sm font-medium"
            style={{
              background: activeSubview === 'encoder' ? '#2E3A8C' : 'transparent',
              color: activeSubview === 'encoder' ? '#FFFFFF' : '#6B7280'
            }}
          >
            Encoder
          </button>
        </div>
      </div>

      {activeSubview === 'dashboard-view' ? (
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
      ) : (
        <EncoderPage />
      )}
    </div>
  );
}

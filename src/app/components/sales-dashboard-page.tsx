import React from 'react';

export function SalesDashboardPage() {
  const cards = [
    { label: 'Today Sales', value: 'PHP 0.00' },
    { label: 'New Entries', value: '0' },
    { label: 'Inventory Alerts', value: '0' }
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold erp-title-primary mb-4">Sales Dashboard</h1>
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

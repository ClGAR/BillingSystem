import React from 'react';
import { Building2 } from 'lucide-react';

export function Navigation() {
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
    </div>
  );
}

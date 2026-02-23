import React from "react";

export function SalesDashboardSalesReportPage() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Sales Report</h1>
      <p className="mt-2 text-gray-600">Under construction</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="date"
          disabled
          placeholder="Date From"
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-400 cursor-not-allowed"
        />
        <input
          type="date"
          disabled
          placeholder="Date To"
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-400 cursor-not-allowed"
        />
        <button
          type="button"
          disabled
          className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-500 text-sm font-medium cursor-not-allowed"
        >
          Generate Report
        </button>
      </div>
    </div>
  );
}

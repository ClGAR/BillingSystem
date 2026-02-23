import React from "react";

export function SalesDashboardEncoderPage() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Encoder</h1>
      <p className="mt-2 text-gray-600">Under construction</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled
          className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-500 text-sm font-medium cursor-not-allowed"
        >
          Save Entry
        </button>
        <button
          type="button"
          disabled
          className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-500 text-sm font-medium cursor-not-allowed"
        >
          Clear Form
        </button>
      </div>
    </div>
  );
}

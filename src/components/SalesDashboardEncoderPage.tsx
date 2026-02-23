import React from "react";
import { EncoderForm } from "./sales-dashboard/EncoderForm";

export function SalesDashboardEncoderPage() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">New Sale Entry</h1>
      </div>
      <EncoderForm />
    </div>
  );
}

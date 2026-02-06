import React from "react";
import { Link } from "react-router-dom";

const formLinks = [
  { label: "Event Request Form", to: "/forms/event-request" },
  { label: "Special Company Events Checklist", to: "/forms/special-company-events" },
  { label: "Prospect Invitation Guide", to: "/forms/prospect-invitation" }
];

export function EventFormsHome() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-16">
        <div className="max-w-[1440px] mx-auto px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Event Forms</h1>
            <p className="text-gray-600 mt-1">
              Choose a form to get started with your event requests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-200 hover:shadow-sm transition"
              >
                <div className="text-gray-900 font-medium">{link.label}</div>
                <div className="text-sm text-gray-600 mt-1">Open form</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

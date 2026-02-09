"use client";

import Link from "next/link";

export default function ErrorPage() {
  return (
    <div className="rounded-lg border border-red-200 bg-white p-6">
      <h2 className="text-xl font-semibold text-slate-900">Something went wrong.</h2>
      <p className="mt-2 text-sm text-slate-700">A mock error page is available for graceful fallback routing.</p>
      <div className="mt-4">
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

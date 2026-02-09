"use client";

import { useState } from "react";
import { Leader } from "@/types/encoder";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type LeaderSelectorProps = {
  leaders: Leader[];
};

export function LeaderSelector({ leaders }: LeaderSelectorProps) {
  const [selectedLeaderId, setSelectedLeaderId] = useState(leaders[0]?.id ?? "");
  const selected = leaders.find((leader) => leader.id === selectedLeaderId);

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Leader Selector</h3>
        {selected ? <Badge variant="success">Selected: {selected.name}</Badge> : null}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {leaders.map((leader) => (
          <button
            key={leader.id}
            type="button"
            className={`rounded-md border px-3 py-2 text-left text-sm ${
              selectedLeaderId === leader.id ? "border-slate-900 bg-slate-100 text-slate-900" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
            onClick={() => setSelectedLeaderId(leader.id)}
          >
            {leader.name}
          </button>
        ))}
      </div>
    </Card>
  );
}

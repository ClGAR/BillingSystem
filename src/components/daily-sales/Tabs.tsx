"use client";

type TabItem = {
  id: string;
  label: string;
};

type TabsProps = {
  items: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
};

export function Tabs({ items, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-2">
      <div className="flex min-w-max gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              activeTab === item.id ? "bg-slate-900 text-white" : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
            onClick={() => onTabChange(item.id)}
            aria-pressed={activeTab === item.id}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

import { DataTable } from "@/components/ui/DataTable";
import { RecentSale } from "@/types/dailySales";

type RecentSalesTableProps = {
  rows: RecentSale[];
};

export function RecentSalesTable({ rows }: RecentSalesTableProps) {
  return (
    <DataTable
      data={rows}
      columns={[
        { key: "invoice", header: "Invoice" },
        { key: "customer", header: "Customer" },
        {
          key: "amount",
          header: "Amount",
          render: (value) => `$${Number(value).toFixed(2)}`,
        },
        { key: "date", header: "Date" },
      ]}
    />
  );
}

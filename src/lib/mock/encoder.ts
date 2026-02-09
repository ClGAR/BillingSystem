import { Expense, Leader, TargetRatio } from "@/types/encoder";

export const initialTargetRatio: TargetRatio = {
  package: 60,
  retail: 40,
};

export const leaders: Leader[] = [
  { id: "l1", name: "Alex Rivera" },
  { id: "l2", name: "Jordan Kim" },
  { id: "l3", name: "Morgan Lee" },
];

export const initialExpenses: Expense[] = [
  { id: "e1", category: "Utilities", amount: 210 },
  { id: "e2", category: "Supplies", amount: 135.5 },
];

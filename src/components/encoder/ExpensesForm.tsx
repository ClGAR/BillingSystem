"use client";

import { FormEvent, useState } from "react";
import { Expense } from "@/types/encoder";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type ExpensesFormProps = {
  initialExpenses: Expense[];
};

export function ExpensesForm({ initialExpenses }: ExpensesFormProps) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");

  const addExpense = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!category || !amount) {
      return;
    }

    setExpenses((prev) => [
      ...prev,
      { id: `e-${prev.length + 1}`, category, amount: Number(amount) },
    ]);
    setCategory("");
    setAmount("");
  };

  return (
    <Card>
      <h3 className="mb-3 text-lg font-semibold text-slate-900">Expenses</h3>
      <form className="mb-4 grid gap-3 sm:grid-cols-3" onSubmit={addExpense}>
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Category
          <input value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 rounded-md border border-slate-300 px-3" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Amount
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="h-10 rounded-md border border-slate-300 px-3"
          />
        </label>
        <div className="flex items-end">
          <Button type="submit">Add Expense</Button>
        </div>
      </form>
      <ul className="space-y-2 text-sm">
        {expenses.map((expense) => (
          <li key={expense.id} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2">
            <span>{expense.category}</span>
            <span>${expense.amount.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

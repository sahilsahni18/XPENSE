import { Expense } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export async function fetchExpenses(params: { category?: string; sort?: string }): Promise<Expense[]> {
  const url = new URL(`${API_BASE}/expenses`);
  if (params.category) url.searchParams.set("category", params.category);
  if (params.sort) url.searchParams.set("sort", params.sort);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch expenses");
  return res.json();
}

export async function createExpense(input: {
  amount: string;
  category: string;
  description: string;
  date: string;
  idempotencyKey: string;
}): Promise<Expense> {
  const res = await fetch(`${API_BASE}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": input.idempotencyKey
    },
    body: JSON.stringify({
      amount: input.amount,
      category: input.category,
      description: input.description,
      date: input.date
    })
  });

  if (!res.ok) {
    const msg = await res.json().catch(() => ({}));
    throw new Error(msg.error || "Failed to create expense");
  }

  return res.json();
}
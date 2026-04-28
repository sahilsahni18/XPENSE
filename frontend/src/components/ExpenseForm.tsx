import { useState } from "react";

type Props = {
  onCreate: (input: {
    amount: string;
    category: string;
    description: string;
    date: string;
    idempotencyKey: string;
  }) => Promise<void>;
  loading: boolean;
};

const CATEGORY_OPTIONS = [
  "Rent / Housing",
  "Utilities (electricity, water, gas)",
  "Groceries",
  "Transportation (fuel, public transport, cab)",
  "Insurance (health, vehicle, life)",
  "Bills & Subscriptions (phone, internet, OTT)",
  "Food & Dining"
];

export default function ExpenseForm({ onCreate, loading }: Props) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!amount || !category || !description || !date) {
      setError("All fields are required.");
      return;
    }

    const idempotencyKey = crypto.randomUUID();
    const isoDate = new Date(date).toISOString();
    await onCreate({ amount, category, description, date: isoDate, idempotencyKey });

    setAmount("");
    setDescription("");
    setDate("");
    setCategory(CATEGORY_OPTIONS[0]);
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Add Expense</h2>
      {error && <p className="error">{error}</p>}
      <div className="grid">
        <label>
          Amount (INR)
          <input
            type="text"
            value={amount}
            placeholder="e.g. 199.99"
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
          />
        </label>
        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={loading}>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          Description
          <input
            type="text"
            value={description}
            placeholder="e.g. Lunch"
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </label>
        <label>
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={loading}
          />
        </label>
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Add Expense"}
      </button>
    </form>
  );
}
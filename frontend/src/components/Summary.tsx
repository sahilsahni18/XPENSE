import { Expense } from "../types";
import { formatINRFromCents } from "../utils/format";

type Props = {
  expenses: Expense[];
};

export default function Summary({ expenses }: Props) {
  const totals = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amountCents;
    return acc;
  }, {});

  const rows = Object.entries(totals);

  if (rows.length === 0) {
    return <div className="card empty">No category summary yet.</div>;
  }

  return (
    <div className="card">
      <h2>Summary by Category</h2>
      <ul className="summary">
        {rows.map(([category, total]) => (
          <li key={category}>
            <span>{category}</span>
            <strong>{formatINRFromCents(total)}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
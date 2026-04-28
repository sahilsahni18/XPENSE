import { Expense } from "../types";
import { formatINRFromCents } from "../utils/format";

type Props = {
  expenses: Expense[];
};

export default function ExpenseTable({ expenses }: Props) {
  if (expenses.length === 0) {
    return <div className="card empty">No expenses yet.</div>;
  }

  return (
    <div className="card">
      <h2>Expenses</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e.id}>
              <td>{new Date(e.date).toLocaleDateString()}</td>
              <td>{e.category}</td>
              <td>{e.description}</td>
              <td>{formatINRFromCents(e.amountCents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
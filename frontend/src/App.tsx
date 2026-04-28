import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { createExpense, fetchExpenses } from "./api/client";
import { Expense } from "./types";
import { formatINRFromCents } from "./utils/format";
import "./styles.css";

const CATEGORY_OPTIONS = [
  "Rent / Housing",
  "Utilities",
  "Groceries",
  "Transportation",
  "Insurance",
  "Bills & Subscriptions",
  "Food & Dining"
];

const CATEGORY_COLORS: Record<string, string> = {
  "Food & Dining": "#FF9500",
  Groceries: "#ccff00",
  "Rent / Housing": "#1d61ff",
  Utilities: "#5AC8FA",
  Transportation: "#FF2D55",
  Insurance: "#AF52DE",
  "Bills & Subscriptions": "#FFCC00"
};

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "date_desc";

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState("");
  const [categoryInput, setCategoryInput] = useState(CATEGORY_OPTIONS[0]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  async function loadExpenses() {
    setLoadingList(true);
    setError(null);
    try {
      const data = await fetchExpenses({ category, sort });
      setExpenses(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingList(false);
    }
  }

  async function loadAllExpenses() {
    try {
      const data = await fetchExpenses({ sort: "date_desc" });
      setAllExpenses(data);
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, [category, sort]);

  useEffect(() => {
    loadAllExpenses();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!amount || !categoryInput || !description || !date) {
      setError("All fields are required.");
      return;
    }

    setLoadingForm(true);
    try {
      const idempotencyKey = crypto.randomUUID();
      const isoDate = new Date(date).toISOString();
      await createExpense({
        amount,
        category: categoryInput,
        description,
        date: isoDate,
        idempotencyKey
      });
      setAmount("");
      setDescription("");
      setDate("");
      setCategoryInput(CATEGORY_OPTIONS[0]);
      await Promise.all([loadExpenses(), loadAllExpenses()]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingForm(false);
    }
  }

  const totalCents = expenses.reduce((sum, e) => sum + e.amountCents, 0);
  const totalAllCents = allExpenses.reduce((sum, e) => sum + e.amountCents, 0);

  const summary = useMemo(() => {
    const map: Record<string, number> = {};
    allExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amountCents;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [allExpenses]);

  const topCategory = useMemo(() => {
    const map: Record<string, number> = {};
    allExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amountCents;
    });
    const entries = Object.entries(map);
    if (entries.length === 0) return { name: "None", amount: 0 };
    entries.sort((a, b) => b[1] - a[1]);
    return { name: entries[0][0], amount: entries[0][1] };
  }, [allExpenses]);

  const percent =
    totalAllCents === 0
      ? 0
      : category
      ? totalCents / totalAllCents
      : topCategory.amount / totalAllCents;

  const displayPercent = Math.round(percent * 100);
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - percent);

  return (
    <div className="max-w-[1440px] mx-auto px-10">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-[40px] leading-tight font-semibold tracking-tight">
            XPENSE
          </h1>
        </div>

        <div className="text-right">
          <p className="text-textGray text-[13px] font-medium mb-1.5">
            Total Expenses
          </p>
          <div className="text-3xl font-semibold flex items-start gap-1 justify-end">
            <span className="text-textGray text-lg mt-1">₹</span>
            {formatINRFromCents(totalAllCents).replace("₹", "")}
          </div>
        </div>
      </header>

      {error && (
        <div className="text-red-400 mb-6 text-sm font-medium">{error}</div>
      )}

      <main className="grid grid-cols-12 gap-6">
        {/* LEFT COLUMN */}
        <div className="col-span-4 flex flex-col gap-6">
          <div className="bg-cardDark rounded-4xl p-8 border border-white/[0.04] relative overflow-hidden h-[540px]">
            <div className="stripe-overlay"></div>
            <h2 className="text-sm font-semibold tracking-wider text-white/60 uppercase mb-6 relative z-10">
              Add Expense
            </h2>

            <form className="space-y-4 relative z-10" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[13px] text-textGray mb-2 font-medium">
                  Amount (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-textGray font-medium">
                    ₹
                  </span>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 199.99"
                    className="w-full custom-input rounded-xl py-3 pl-8 pr-4 text-[15px] font-medium placeholder-white/20"
                    disabled={loadingForm}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] text-textGray mb-2 font-medium">
                  Category
                </label>
                <select
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  className="w-full custom-select custom-input rounded-xl py-3 px-4 text-[15px]"
                  disabled={loadingForm}
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] text-textGray mb-2 font-medium">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Lunch with team"
                  className="w-full custom-input rounded-xl py-3 px-4 text-[15px] placeholder-white/20"
                  disabled={loadingForm}
                />
              </div>

              <div>
                <label className="block text-[13px] text-textGray mb-2 font-medium">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full custom-date custom-input rounded-xl py-3 px-4 text-[15px] text-white/90"
                  disabled={loadingForm}
                />
              </div>

              <button
                className="w-full mt-2 bg-black hover:bg-[#111] text-white font-medium py-3.5 rounded-xl transition-colors border border-white/10 flex items-center justify-center gap-2"
                disabled={loadingForm}
              >
                {loadingForm ? "Saving..." : "Add Expense"}
              </button>
            </form>
          </div>
        </div>

        {/* MIDDLE COLUMN */}
        <div className="col-span-4 flex flex-col gap-6">
          <div className="bg-accentBlue rounded-4xl p-5 h-[220px] flex flex-col justify-between relative overflow-hidden group shadow-[0_20px_40px_rgba(29,97,255,0.2)]">
            <div className="absolute top-0 right-0 w-[240px] h-[240px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <h2 className="text-sm font-semibold tracking-wider text-white/80 uppercase relative z-10">
              Monthly Spending
            </h2>

            <div className="flex items-center justify-between mt-2 relative z-10">
              <div className="text-[48px] font-bold tracking-tighter leading-none">
                {displayPercent}%
              </div>

              <div className="relative w-[100px] h-[100px]">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="transparent"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="18"
                  ></circle>
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="transparent"
                    stroke="#ffffff"
                    strokeWidth="18"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold tracking-wider opacity-80">
                    SPENT
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-white/70 relative z-10">
              {category
                ? `${category} share of total expenses`
                : `Top category: ${topCategory.name}`}
            </div>
          </div>

          <div className="bg-cardDark rounded-4xl p-8 border border-white/[0.04] relative overflow-hidden h-[320px]">
            <div className="stripe-overlay"></div>
            <h2 className="text-sm font-semibold tracking-wider text-white/60 uppercase mb-6 relative z-10">
              Summary by Category
            </h2>

            {summary.length === 0 ? (
              <div className="text-white/40 text-sm">No expenses yet.</div>
            ) : (
              <div className="space-y-1">
                {summary.map(([cat, total]) => (
                  <div
                    key={cat}
                    className={`flex justify-between items-center py-4 border-b border-white/[0.04] group -mx-4 px-4 rounded-xl transition-colors ${
                      category === cat
                        ? "bg-accentBlue/20 ring-1 ring-accentBlue/40"
                        : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[cat] || "#999" }}
                      ></div>
                      <span className="text-[15px] text-gray-200 font-medium">
                        {cat}
                      </span>
                    </div>
                    <span className="font-semibold">
                      {formatINRFromCents(total)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-4 flex flex-col gap-6">
          <div className="bg-cardDark rounded-4xl p-8 border border-white/[0.04] h-[140px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold tracking-wider text-white/60 uppercase">
                Filters
              </h2>
              <span className="text-xs text-textGray">Refine view</span>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs text-textGray mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    const next = new URLSearchParams(searchParams);
                    if (e.target.value) next.set("category", e.target.value);
                    else next.delete("category");
                    next.set("sort", "date_desc");
                    setSearchParams(next);
                  }}
                  className="w-full custom-select custom-input rounded-lg py-2.5 px-3 text-sm"
                >
                  <option value="">All</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-textGray mb-2">
                  Sort by date
                </label>
                <select
                  value={sort}
                  onChange={(e) => {
                    const next = new URLSearchParams(searchParams);
                    next.set("sort", e.target.value);
                    setSearchParams(next);
                  }}
                  className="w-full custom-select custom-input rounded-lg py-2.5 px-3 text-sm"
                >
                  <option value="date_desc">Newest first</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-cardDark rounded-4xl p-8 border border-white/[0.04] h-[400px] flex flex-col">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Recent Expenses</h2>
                <p className="text-sm text-textGray">
                  Your transactions for this period
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm text-textGray mb-1">
                  Total Expenses
                </span>
                <div className="text-2xl font-semibold flex items-center gap-2">
                  <span className="text-accentLime">
                    {formatINRFromCents(totalCents)}
                  </span>
                </div>
              </div>
            </div>

            {loadingList ? (
              <div className="text-white/50 text-sm">Loading…</div>
            ) : expenses.length === 0 ? (
              <div className="text-white/50 text-sm">No expenses yet.</div>
            ) : (
              <div className="overflow-y-auto pr-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[12px] text-textGray uppercase tracking-wider border-b border-white/[0.06]">
                      <th className="pb-4 font-medium pl-2 w-[110px]">Date</th>
                      <th className="pb-4 font-medium w-[180px]">Category</th>
                      <th className="pb-4 font-medium">Description</th>
                      <th className="pb-4 font-medium text-right pr-2 w-[120px]">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[14px]">
                    {expenses.map((e) => (
                      <tr
                        key={e.id}
                        className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-4 pl-2 text-white/80">
                          {new Date(e.date).toLocaleDateString()}
                        </td>
                        <td className="py-4">
                          <span className="px-3 py-1 bg-white/5 rounded-full text-xs border border-white/5 inline-flex items-center gap-2">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                backgroundColor:
                                  CATEGORY_COLORS[e.category] || "#999"
                              }}
                            ></span>
                            {e.category}
                          </span>
                        </td>
                        <td className="py-4 text-white/90">{e.description}</td>
                        <td className="py-4 text-right font-semibold">
                          {formatINRFromCents(e.amountCents)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

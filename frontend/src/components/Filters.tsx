type Props = {
  category: string;
  categories: string[];
  sort: string;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: string) => void;
};

export default function Filters({ category, categories, sort, onCategoryChange, onSortChange }: Props) {
  return (
    <div className="card">
      <h2>Filters</h2>
      <div className="grid">
        <label>
          Category
          <select value={category} onChange={(e) => onCategoryChange(e.target.value)}>
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label>
          Sort by date
          <select value={sort} onChange={(e) => onSortChange(e.target.value)}>
            <option value="date_desc">Newest first</option>
          </select>
        </label>
      </div>
    </div>
  );
}
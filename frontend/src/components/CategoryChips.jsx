const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "restaurant", label: "Restaurants" },
  { key: "cafe", label: "Cafés" },
  { key: "hotel", label: "Hotels" },
  { key: "bar", label: "Bars" },
  { key: "streetfood", label: "Street Food" },
  { key: "tourist", label: "Tourist Spots" },
];

const CategoryChips = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-2" data-testid="category-chips">
    {CATEGORIES.map((c) => {
      const active = value === c.key;
      return (
        <button
          key={c.key}
          data-testid={`chip-${c.key}`}
          onClick={() => onChange(c.key)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
            active
              ? "bg-scout-ink text-scout-bg border-scout-ink"
              : "border-stone-300 text-stone-600 hover:border-scout-ink hover:text-scout-ink"
          }`}
        >
          {c.label}
        </button>
      );
    })}
  </div>
);

export default CategoryChips;

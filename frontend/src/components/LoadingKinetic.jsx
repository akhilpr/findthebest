const LoadingKinetic = ({ steps }) => {
  const defaults = [
    "Scanning YouTube for reviews",
    "Extracting comments",
    "Weighing sentiment",
    "Composing the verdict",
  ];
  const items = steps || defaults;
  return (
    <div className="flex flex-col items-start gap-3 py-8" data-testid="loading-kinetic">
      <div className="flex items-center gap-1">
        <span className="pulse-dot w-2 h-2 rounded-full bg-scout-terracotta" />
        <span className="pulse-dot w-2 h-2 rounded-full bg-scout-terracotta" />
        <span className="pulse-dot w-2 h-2 rounded-full bg-scout-terracotta" />
      </div>
      <ul className="font-mono text-sm text-stone-600 space-y-1">
        {items.map((s, i) => (
          <li key={i} className="fade-up" style={{ animationDelay: `${i * 300}ms` }}>
            → {s}...
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LoadingKinetic;

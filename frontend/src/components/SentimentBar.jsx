const SentimentBar = ({ pos = 0, neg = 0, neu = 0 }) => {
  const total = Math.max(pos + neg + neu, 1);
  const p = (pos / total) * 100;
  const n = (neg / total) * 100;
  const u = (neu / total) * 100;
  return (
    <div className="w-full" data-testid="sentiment-bar">
      <div className="h-1.5 w-full flex overflow-hidden rounded-full bg-stone-200">
        <div style={{ width: `${p}%` }} className="bg-scout-olive" title={`Positive ${pos}%`} />
        <div style={{ width: `${u}%` }} className="bg-stone-400" title={`Neutral ${neu}%`} />
        <div style={{ width: `${n}%` }} className="bg-scout-terracotta" title={`Negative ${neg}%`} />
      </div>
      <div className="flex justify-between mt-2 font-mono text-[10px] uppercase tracking-widest text-stone-500">
        <span>+ {pos}% positive</span>
        <span>~ {neu}% neutral</span>
        <span>− {neg}% critical</span>
      </div>
    </div>
  );
};

export default SentimentBar;

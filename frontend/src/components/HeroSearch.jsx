import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlass, Sparkle } from "@phosphor-icons/react";

const HeroSearch = () => {
  const [q, setQ] = useState("");
  const nav = useNavigate();

  const go = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    nav(`/analyze?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <form onSubmit={go} className="w-full max-w-2xl" data-testid="hero-search-form">
      <div className="relative flex items-center bg-white border border-stone-300 rounded-full shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <MagnifyingGlass size={20} className="absolute left-5 text-stone-400" />
        <input
          data-testid="hero-search-input"
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try 'best ramen in Tokyo' or 'Bar Basso Milan'"
          className="w-full py-4 pl-14 pr-32 sm:pr-40 text-base bg-transparent outline-none placeholder:text-stone-400"
        />
        <button
          type="submit"
          data-testid="hero-search-submit"
          className="absolute right-1.5 top-1.5 bottom-1.5 px-4 sm:px-5 bg-scout-ink text-scout-bg rounded-full text-sm font-medium inline-flex items-center gap-1.5 hover:bg-scout-terracotta transition-colors"
        >
          <Sparkle size={14} weight="fill" />
          <span className="hidden sm:inline">Analyze</span>
        </button>
      </div>
      <div className="flex items-center gap-2 mt-3 px-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500">Try:</span>
        {["Katz's Deli NYC", "Ronin Hong Kong", "Amalfi Coast"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setQ(s)}
            className="text-xs text-stone-500 hover:text-scout-terracotta underline underline-offset-4 decoration-stone-300"
          >
            {s}
          </button>
        ))}
      </div>
    </form>
  );
};

export default HeroSearch;

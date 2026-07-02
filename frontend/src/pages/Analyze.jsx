import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { analyzePlace } from "@/lib/api";
import LoadingKinetic from "@/components/LoadingKinetic";
import { Sparkle, MagnifyingGlass, MapPin } from "@phosphor-icons/react";

const CATS = [
  { key: "restaurant", label: "Restaurant" },
  { key: "cafe", label: "Café" },
  { key: "hotel", label: "Hotel" },
  { key: "bar", label: "Bar / Pub" },
  { key: "streetfood", label: "Street Food" },
  { key: "tourist", label: "Tourist Spot" },
];

const Analyze = () => {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [name, setName] = useState(params.get("q") || "");
  const [city, setCity] = useState("");
  const [cat, setCat] = useState("restaurant");
  const [loading, setLoading] = useState(false);

  const run = async (e) => {
    e?.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a place name");
      return;
    }
    setLoading(true);
    try {
      const place = await analyzePlace({ place_name: name.trim(), city: city.trim(), category: cat });
      toast.success("Analysis ready");
      nav(`/place/${place.id}`);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Analysis failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.get("q") && params.get("auto") === "1") {
      run();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-6 lg:px-10 py-16" data-testid="analyze-page">
      <div className="text-center max-w-2xl mx-auto fade-up">
        <div className="inline-flex items-center gap-2 border border-stone-300 rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-[0.25em] text-stone-600">
          <Sparkle size={12} weight="fill" className="text-scout-terracotta" /> Live YouTube analysis
        </div>
        <h1 className="font-serif text-5xl sm:text-6xl leading-[0.95] tracking-tight mt-6">
          Point Scout at anything.
        </h1>
        <p className="text-lg text-stone-600 mt-4">
          Enter a place name and we'll synthesize a verdict from thousands of YouTube reviews, videos and comments in seconds.
        </p>
      </div>

      <form onSubmit={run} className="mt-12 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-5">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500 block mb-2">Place name</label>
          <div className="relative">
            <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              autoFocus
              data-testid="analyze-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Katz's Delicatessen"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:border-scout-ink outline-none text-base transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500 block mb-2">City <span className="text-stone-400">(optional)</span></label>
          <div className="relative">
            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              data-testid="analyze-city-input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. New York"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:border-scout-ink outline-none text-base transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500 block mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATS.map((c) => (
              <button
                key={c.key}
                type="button"
                data-testid={`analyze-cat-${c.key}`}
                onClick={() => setCat(c.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                  cat === c.key
                    ? "bg-scout-ink text-scout-bg border-scout-ink"
                    : "border-stone-300 text-stone-600 hover:border-scout-ink"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          data-testid="analyze-submit"
          className="w-full mt-2 bg-scout-terracotta text-white py-4 rounded-xl font-medium inline-flex items-center justify-center gap-2 hover:bg-scout-ink transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Sparkle size={16} weight="fill" />
          {loading ? "Analyzing..." : "Run Scout analysis"}
        </button>

        {loading && (
          <div className="border-t border-stone-200 pt-4">
            <LoadingKinetic />
          </div>
        )}
      </form>

      <p className="text-center mt-8 font-mono text-[11px] uppercase tracking-widest text-stone-500">
        Powered by Gemini 3 Flash · Analysis takes ~5–15 seconds
      </p>
    </main>
  );
};

export default Analyze;

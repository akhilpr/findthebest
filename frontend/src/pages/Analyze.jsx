import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { analyzePlace, discoverPlaces } from "@/lib/api";
import LoadingKinetic from "@/components/LoadingKinetic";
import PlaceCard from "@/components/PlaceCard";
import { Sparkle, MagnifyingGlass, MapPin, Storefront, Buildings } from "@phosphor-icons/react";

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
  const [mode, setMode] = useState("discover"); // discover | specific
  const [name, setName] = useState(params.get("q") || "");
  const [city, setCity] = useState("");
  const [cat, setCat] = useState("restaurant");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const runSpecific = async () => {
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
      toast.error(err?.response?.data?.detail || "Analysis failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const runDiscover = async () => {
    if (!city.trim()) {
      toast.error("Please enter a city");
      return;
    }
    setLoading(true);
    setResults([]);
    try {
      const places = await discoverPlaces({ city: city.trim(), category: cat });
      setResults(places);
      toast.success(`Found ${places.length} top ${cat === "streetfood" ? "spots" : cat + "s"} in ${city.trim()}`);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Discovery failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const submit = (e) => {
    e?.preventDefault();
    if (mode === "specific") runSpecific();
    else runDiscover();
  };

  useEffect(() => {
    if (params.get("q")) setMode("specific");
  }, [params]);

  return (
    <main className="max-w-5xl mx-auto px-6 lg:px-10 py-16" data-testid="analyze-page">
      <div className="text-center max-w-2xl mx-auto fade-up">
        <div className="inline-flex items-center gap-2 border border-stone-300 rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-[0.25em] text-stone-600">
          <Sparkle size={12} weight="fill" className="text-scout-terracotta" /> Live YouTube analysis
        </div>
        <h1 className="font-serif text-5xl sm:text-6xl leading-[0.95] tracking-tight mt-6">
          Point Scout at anything.
        </h1>
        <p className="text-lg text-stone-600 mt-4">
          Find the top places in any city, or run a deep-dive verdict on a specific establishment.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="mt-10 flex justify-center">
        <div className="inline-flex bg-white border border-stone-200 rounded-full p-1">
          <button
            type="button"
            data-testid="mode-discover"
            onClick={() => { setMode("discover"); setResults([]); }}
            className={`px-5 py-2.5 rounded-full text-sm font-medium inline-flex items-center gap-1.5 transition-colors ${mode === "discover" ? "bg-scout-ink text-scout-bg" : "text-stone-600 hover:text-scout-ink"}`}
          >
            <Buildings size={14} weight="duotone" /> Find best in city
          </button>
          <button
            type="button"
            data-testid="mode-specific"
            onClick={() => { setMode("specific"); setResults([]); }}
            className={`px-5 py-2.5 rounded-full text-sm font-medium inline-flex items-center gap-1.5 transition-colors ${mode === "specific" ? "bg-scout-ink text-scout-bg" : "text-stone-600 hover:text-scout-ink"}`}
          >
            <Storefront size={14} weight="duotone" /> Analyze specific place
          </button>
        </div>
      </div>

      <form onSubmit={submit} className="mt-8 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-5">
        {mode === "specific" && (
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
        )}

        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500 block mb-2">
            City {mode === "specific" && <span className="text-stone-400">(optional)</span>}
          </label>
          <div className="relative">
            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              data-testid="analyze-city-input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={mode === "discover" ? "e.g. Tokyo, Bangalore, Lisbon..." : "e.g. New York"}
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
          {loading ? (mode === "discover" ? "Discovering..." : "Analyzing...") : (mode === "discover" ? "Find top places" : "Run deep analysis")}
        </button>

        {loading && (
          <div className="border-t border-stone-200 pt-4">
            <LoadingKinetic
              steps={mode === "discover"
                ? ["Scanning food & travel channels", "Cross-referencing top-mentioned spots", "Ranking by sentiment", "Composing shortlist"]
                : undefined}
            />
          </div>
        )}
      </form>

      {results.length > 0 && (
        <section className="mt-14" data-testid="discover-results">
          <div className="mb-8">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500 mb-2">Results</div>
            <h2 className="font-serif text-4xl tracking-tight">Top {cat === "streetfood" ? "street food" : cat + "s"} in {city}</h2>
            <p className="text-sm text-stone-500 mt-1 font-mono">Sorted by YouTube sentiment score</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((p, i) => (
              <PlaceCard key={p.id} place={p} index={i} />
            ))}
          </div>
        </section>
      )}

      <p className="text-center mt-8 font-mono text-[11px] uppercase tracking-widest text-stone-500">
        Powered by Gemini 3 Flash · Analysis takes ~5–20 seconds
      </p>
    </main>
  );
};

export default Analyze;

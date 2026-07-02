import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchTrending, fetchPlaces } from "@/lib/api";
import PlaceCard from "@/components/PlaceCard";
import CategoryChips from "@/components/CategoryChips";
import HeroSearch from "@/components/HeroSearch";
import { ArrowUpRight, PlayCircle, ChatCircle, TrendUp } from "@phosphor-icons/react";

const Home = () => {
  const [trending, setTrending] = useState([]);
  const [places, setPlaces] = useState([]);
  const [cat, setCat] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const t = await fetchTrending().catch(() => []);
      setTrending(t);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const p = await fetchPlaces(cat === "all" ? {} : { category: cat }).catch(() => []);
      setPlaces(p);
    })();
  }, [cat]);

  const hero = trending[0];

  return (
    <main className="max-w-7xl mx-auto px-6 lg:px-10 pb-24" data-testid="home-page">
      {/* HERO */}
      <section className="pt-12 pb-16 lg:pt-20 lg:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 space-y-8 fade-up">
          <div className="inline-flex items-center gap-2 border border-stone-300 rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-[0.25em] text-stone-600">
            <span className="w-1.5 h-1.5 rounded-full bg-scout-terracotta animate-pulse" />
            AI Reading YouTube So You Don't Have To
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-scout-ink">
            The best places,<br />
            <span className="italic text-scout-terracotta">verified</span> by every<br />
            food creator alive.
          </h1>
          <p className="text-lg text-stone-600 max-w-xl leading-relaxed">
            Scout distills thousands of YouTube reviews, comments, and travel vlogs into a single, honest verdict on any restaurant, café, hotel, bar, or tourist spot on the planet.
          </p>
          <HeroSearch />
          <div className="flex flex-wrap gap-6 pt-4 font-mono text-xs uppercase tracking-widest text-stone-500">
            <span className="inline-flex items-center gap-2"><PlayCircle size={16} weight="duotone" /> 12,400 videos indexed</span>
            <span className="inline-flex items-center gap-2"><ChatCircle size={16} weight="duotone" /> 1.2M comments analyzed</span>
            <span className="inline-flex items-center gap-2"><TrendUp size={16} weight="duotone" /> Updated daily</span>
          </div>
        </div>

        {/* Hero image mosaic — bento */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3 h-[520px]">
          <div className="col-span-2 row-span-1 overflow-hidden rounded-2xl bg-stone-100 relative group">
            {hero && (
              <>
                <img src={hero.hero_image} alt={hero.name} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = hero.image; }} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-scout-ink/85 via-scout-ink/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-80">Top-rated this week</div>
                  <div className="font-serif text-3xl leading-tight mt-1">{hero.name}</div>
                  <Link to={`/place/${hero.id}`} data-testid="hero-place-link" className="inline-flex items-center gap-1 text-sm mt-2 hover:text-scout-terracotta transition-colors">
                    See the verdict <ArrowUpRight size={14} />
                  </Link>
                </div>
              </>
            )}
          </div>
          <div className="overflow-hidden rounded-2xl bg-stone-100">
            <img src="https://images.pexels.com/photos/12743256/pexels-photo-12743256.jpeg?w=600" alt="Cafés" className="w-full h-full object-cover" />
          </div>
          <div className="overflow-hidden rounded-2xl bg-stone-100">
            <img src="https://images.unsplash.com/photo-1552879890-3a06dd3a06c2?w=600" alt="Street food" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Trending strip */}
      <section className="border-t border-stone-200 pt-14 pb-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500 mb-2">01 · The consensus</div>
            <h2 className="font-serif text-3xl sm:text-4xl tracking-tight">Places YouTube can't stop talking about</h2>
          </div>
          <div className="hidden sm:block font-mono text-xs text-stone-500">
            [ sorted by sentiment score ↓ ]
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/5] bg-stone-200 rounded-2xl" />
              <div className="h-4 bg-stone-200 rounded mt-4 w-1/2" />
              <div className="h-6 bg-stone-200 rounded mt-3" />
            </div>
          ))}
          {trending.slice(0, 6).map((p, i) => (
            <PlaceCard key={p.id} place={p} index={i} />
          ))}
        </div>
      </section>

      {/* All / by category */}
      <section className="pt-14">
        <div className="mb-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500 mb-2">02 · Browse</div>
          <h2 className="font-serif text-3xl sm:text-4xl tracking-tight mb-6">By category</h2>
          <CategoryChips value={cat} onChange={setCat} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((p, i) => (
            <PlaceCard key={p.id} place={p} index={i} />
          ))}
          {places.length === 0 && (
            <div className="col-span-full text-center py-16 font-mono text-sm text-stone-500">
              No places in this category yet.
            </div>
          )}
        </div>
      </section>

      {/* CTA strip */}
      <section className="mt-24 rounded-3xl bg-scout-ink text-scout-bg px-8 py-14 lg:px-14 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-scout-terracotta mb-3">Analyze anything</div>
            <h3 className="font-serif text-4xl lg:text-5xl leading-tight">
              Got a place in mind?<br />
              <span className="italic text-scout-cream">Let Scout read the room.</span>
            </h3>
          </div>
          <div className="flex lg:justify-end">
            <Link
              to="/analyze"
              data-testid="cta-analyze-link"
              className="inline-flex items-center gap-2 bg-scout-terracotta text-white px-6 py-4 rounded-full text-base font-medium hover:bg-scout-cream hover:text-scout-ink transition-colors"
            >
              Run a live analysis <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="mt-20 pt-8 border-t border-stone-200 flex flex-col sm:flex-row justify-between text-xs font-mono text-stone-500">
        <span>© Scout · Built on YouTube discourse + AI sentiment analysis.</span>
        <span>gemini-3-flash · emergent</span>
      </footer>
    </main>
  );
};

export default Home;

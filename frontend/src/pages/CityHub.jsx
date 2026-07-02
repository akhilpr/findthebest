import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPlaces } from "@/lib/api";
import PlaceCard from "@/components/PlaceCard";
import { ArrowLeft, MapPin } from "@phosphor-icons/react";

const CATS = [
  { key: "restaurant", label: "Restaurants" },
  { key: "cafe", label: "Cafés" },
  { key: "hotel", label: "Hotels" },
  { key: "bar", label: "Bars" },
  { key: "streetfood", label: "Street Food" },
  { key: "tourist", label: "Tourist Spots" },
];

const CityHub = () => {
  const { name } = useParams();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchPlaces({ city: name }).then((d) => setPlaces(d || [])).finally(() => setLoading(false));
  }, [name]);

  const byCat = CATS.map((c) => ({ ...c, items: places.filter((p) => p.category === c.key).sort((a, b) => b.verdict.sentiment_score - a.verdict.sentiment_score) })).filter((g) => g.items.length > 0);
  const total = places.length;

  return (
    <main className="max-w-7xl mx-auto px-6 lg:px-10 pb-24" data-testid="city-hub-page">
      <div className="pt-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-scout-terracotta"><ArrowLeft size={16} /> Back</Link>
      </div>
      <section className="pt-10 pb-4 fade-up">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-scout-terracotta mb-3 inline-flex items-center gap-2">
          <MapPin size={12} weight="fill" /> City Guide
        </div>
        <h1 className="font-serif text-6xl sm:text-7xl leading-[0.95] tracking-tight capitalize" data-testid="city-hub-title">{decodeURIComponent(name)}</h1>
        <p className="mt-4 text-lg text-stone-600 max-w-2xl">
          {total} Scout-verified spots across {byCat.length} categories, ranked by YouTube sentiment.
        </p>
      </section>

      {loading && (
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="animate-pulse aspect-[4/3] bg-stone-200 rounded-2xl" />)}
        </div>
      )}

      {!loading && total === 0 && (
        <div className="mt-16 text-center bg-white rounded-2xl border border-stone-200 p-10">
          <div className="font-serif text-2xl">No places yet in {decodeURIComponent(name)}</div>
          <p className="text-stone-600 mt-2 mb-6">Run a discovery to seed this city.</p>
          <Link to={`/analyze`} className="inline-flex items-center gap-2 bg-scout-terracotta text-white px-6 py-3 rounded-full text-sm font-medium">Discover top places</Link>
        </div>
      )}

      {byCat.map((group) => (
        <section key={group.key} className="mt-14" data-testid={`city-section-${group.key}`}>
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500 mb-2">{group.items.length} spot{group.items.length !== 1 && "s"}</div>
              <h2 className="font-serif text-3xl tracking-tight">{group.label}</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {group.items.slice(0, 8).map((p, i) => <PlaceCard key={p.id} place={p} index={i} />)}
          </div>
        </section>
      ))}
    </main>
  );
};

export default CityHub;

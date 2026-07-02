import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPlace } from "@/lib/api";
import SentimentBar from "@/components/SentimentBar";
import { ArrowLeft, Fire, CheckCircle, XCircle, ForkKnife, Quotes, PlayCircle } from "@phosphor-icons/react";

const PlaceDetail = () => {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const p = await fetchPlace(id).catch(() => null);
      setPlace(p);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="animate-pulse space-y-8">
          <div className="h-4 w-40 bg-stone-200 rounded" />
          <div className="h-[50vh] bg-stone-200 rounded-3xl" />
          <div className="h-8 w-1/2 bg-stone-200 rounded" />
        </div>
      </main>
    );
  }
  if (!place) {
    return (
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-20 text-center">
        <p className="font-mono text-sm text-stone-500">Place not found.</p>
        <Link to="/" className="text-scout-terracotta underline mt-4 inline-block">← Back</Link>
      </main>
    );
  }

  const v = place.verdict;

  return (
    <main className="max-w-7xl mx-auto px-6 lg:px-10 pb-24" data-testid="place-detail-page">
      <div className="pt-8">
        <Link to="/" data-testid="back-link" className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-scout-terracotta transition-colors">
          <ArrowLeft size={16} /> Back to discover
        </Link>
      </div>

      {/* Hero */}
      <section className="mt-6 relative rounded-3xl overflow-hidden h-[50vh] min-h-[420px] bg-stone-900">
        <img src={place.hero_image} alt={place.name} className="w-full h-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-scout-ink/90 via-scout-ink/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-8 lg:p-12 text-white">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-80 mb-2">
            {place.category} · {place.city} {place.country ? `· ${place.country}` : ""}
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight max-w-3xl">
            {place.name}
          </h1>
          <p className="mt-4 text-lg text-white/85 max-w-2xl leading-relaxed">{place.tagline}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-white text-scout-ink font-mono text-sm px-3 py-1.5 rounded-full">
              <Fire size={14} weight="fill" className="text-scout-terracotta" />
              {v.sentiment_score.toFixed(1)} / 10
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
              {v.confidence}% confidence
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
              {v.videos_analyzed} videos · {v.comments_analyzed.toLocaleString()} comments
            </span>
            {place.tags?.map((t) => (
              <span key={t} className="font-mono text-[10px] uppercase tracking-widest bg-scout-terracotta text-white px-3 py-1.5 rounded-full">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Bento grid: Verdict + sentiment + must-try */}
      <section className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-2xl p-8 border border-stone-200">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-scout-terracotta mb-3">The Verdict</div>
          <p className="font-serif text-2xl sm:text-3xl leading-snug text-scout-ink">{v.summary}</p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-stone-500 mb-3">What creators love</div>
              <ul className="space-y-2.5">
                {v.pros.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                    <CheckCircle size={18} weight="fill" className="text-scout-olive shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-stone-500 mb-3">Honest drawbacks</div>
              <ul className="space-y-2.5">
                {v.cons.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                    <XCircle size={18} weight="fill" className="text-scout-terracotta shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-stone-200">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500 mb-4">Sentiment breakdown</div>
            <SentimentBar pos={v.positive_pct} neg={v.negative_pct} neu={v.neutral_pct} />
            <div className="mt-6 pt-4 border-t border-stone-100 font-mono text-xs text-stone-600 space-y-1">
              <div className="flex justify-between"><span>score</span><span>{v.sentiment_score.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>confidence</span><span>{v.confidence}%</span></div>
              <div className="flex justify-between"><span>videos</span><span>{v.videos_analyzed}</span></div>
              <div className="flex justify-between"><span>comments</span><span>{v.comments_analyzed.toLocaleString()}</span></div>
            </div>
          </div>

          <div className="bg-scout-ink text-scout-bg rounded-2xl p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-scout-terracotta mb-3 inline-flex items-center gap-1.5">
              <ForkKnife size={12} weight="fill" /> Must try
            </div>
            <ul className="space-y-2">
              {v.must_try.map((m, i) => (
                <li key={i} className="font-serif text-xl leading-snug border-b border-white/10 pb-2 last:border-0">
                  {i + 1}. {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Videos rail */}
      <section className="mt-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500 mb-2">The sources</div>
            <h3 className="font-serif text-3xl tracking-tight">Videos analyzed</h3>
          </div>
          <div className="font-mono text-xs text-stone-500 hidden sm:block">← scroll →</div>
        </div>
        <div className="flex gap-5 overflow-x-auto rail pb-4 -mx-2 px-2">
          {place.videos.map((vid, i) => (
            <a
              key={i}
              href={`https://www.youtube.com/watch?v=${vid.video_id}`}
              target="_blank"
              rel="noreferrer"
              data-testid={`video-source-${i}`}
              className="min-w-[300px] sm:min-w-[340px] group"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden bg-stone-200">
                <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-scout-ink/70 to-transparent" />
                <PlayCircle size={40} weight="fill" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/90 group-hover:scale-110 transition-transform" />
                <span className="absolute bottom-2 right-2 font-mono text-[10px] uppercase tracking-widest text-white bg-scout-ink/70 px-2 py-0.5 rounded">
                  {vid.views}
                </span>
              </div>
              <div className="mt-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-stone-500">{vid.channel}</div>
                <div className="font-serif text-lg leading-snug mt-1 line-clamp-2 text-scout-ink group-hover:text-scout-terracotta transition-colors">
                  {vid.title}
                </div>
                <p className="mt-2 text-sm text-stone-600 italic leading-snug line-clamp-3">"{vid.quote}"</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Top comments */}
      {place.top_comments?.length > 0 && (
        <section className="mt-14">
          <div className="mb-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500 mb-2">What the audience says</div>
            <h3 className="font-serif text-3xl tracking-tight">Top comments</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {place.top_comments.map((c, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-stone-200 relative">
                <Quotes size={24} weight="fill" className="text-scout-terracotta/40 absolute top-4 right-4" />
                <p className="text-sm leading-relaxed text-stone-700">{c}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default PlaceDetail;

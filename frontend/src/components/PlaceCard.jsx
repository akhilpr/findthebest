import { Link } from "react-router-dom";
import { Fire, MapPin, NavigationArrow } from "@phosphor-icons/react";

const CATEGORY_LABELS = {
  restaurant: "Restaurant",
  cafe: "Café",
  hotel: "Hotel",
  bar: "Bar",
  tourist: "Tourist Spot",
  streetfood: "Street Food",
};

const mapsUrl = (place) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.city || ""}`.trim())}`;

const PlaceCard = ({ place, index = 0 }) => {
  const score = place.verdict?.sentiment_score ?? 0;
  const stopBubble = (e) => e.stopPropagation();
  return (
    <Link
      to={`/place/${place.id}`}
      data-testid={`place-card-${place.id}`}
      className="group block fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-white border border-stone-200">
        <div className="aspect-[4/3] overflow-hidden bg-stone-200">
          <img
            src={place.image}
            alt={place.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200";
            }}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        </div>
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-widest bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-stone-700">
            {CATEGORY_LABELS[place.category] || place.category}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="font-mono text-xs bg-scout-ink text-scout-bg px-2.5 py-1 rounded-full inline-flex items-center gap-1">
            <Fire size={11} weight="fill" className="text-scout-terracotta" /> {score.toFixed(1)}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(mapsUrl(place), "_blank", "noopener,noreferrer"); }}
          data-testid={`card-maps-${place.id}`}
          title="Open in Google Maps"
          aria-label={`Open ${place.name} in Google Maps`}
          className="absolute bottom-3 right-3 bg-white/95 backdrop-blur hover:bg-scout-terracotta hover:text-white text-scout-ink w-9 h-9 rounded-full inline-flex items-center justify-center transition-colors shadow-sm"
        >
          <NavigationArrow size={14} weight="fill" />
        </button>
      </div>
      <div className="pt-4 px-1">
        <div className="flex items-center gap-1 text-stone-500 text-xs mb-1.5">
          <MapPin size={12} weight="regular" />
          <span className="font-mono uppercase tracking-wider">
            {place.city}
          </span>
        </div>
        <h3 data-testid={`place-card-name-${place.id}`} className="font-serif text-2xl leading-tight text-scout-ink group-hover:text-scout-terracotta transition-colors">
          {place.name}
        </h3>
        <p className="text-sm text-stone-600 mt-1.5 line-clamp-2 leading-relaxed">
          {place.tagline}
        </p>
      </div>
    </Link>
  );
};

export default PlaceCard;


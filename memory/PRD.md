# Scout — PRD

## Original Problem Statement
Build an app to find the best places and food places, restaurants, hotels, beer parloar etc simply using youtube video analysis, reviews, youtube comment. From all datas available in internet.

## Product Concept
**Scout** — an editorial discovery app that synthesizes YouTube reviews, videos, and comments into a single honest verdict for any restaurant, café, hotel, bar, tourist spot, or street food stall on Earth.

## Architecture
- **Backend**: FastAPI + MongoDB + Gemini 3 Flash (via Emergent Universal LLM Key `emergentintegrations`).
- **Frontend**: React 19 + Tailwind + Playfair Display / Manrope / JetBrains Mono, Phosphor icons, sonner toasts.
- **AI**: Live analysis endpoint uses Gemini 3 Flash to synthesize a JSON verdict (summary, pros, cons, must-try, sentiment %, videos, top comments, tags) from the model's knowledge of YouTube discourse.
- **Data**: 8 hand-curated seed places auto-seeded on first `/api/trending` or `/api/places` request. Live analyses are cached in `analyses` collection and persisted to `places`.

## User Personas
1. **Traveler planning a trip** — wants a shortlist of trustworthy spots per city.
2. **Foodie chasing viral places** — wants an honest verdict on YouTube-hyped restaurants.
3. **Business travelers** — quickly discover top-rated hotels/bars in a city.

## What's Been Implemented (2026-07-02)
- Home page with editorial hero, HeroSearch, bento image mosaic, trending strip, category-filtered grid, CTA strip.
- PlaceDetail page: cinematic hero, bento verdict/sentiment/must-try, video rail, top comments.
- Analyze page: live AI analysis form with kinetic loading state and toast feedback.
- Backend endpoints: `/api/trending`, `/api/places`, `/api/places/{id}`, `/api/analyze`.
- Curated seed data for 8 iconic places across 6 categories.
- Live AI verdict generation with caching.
- Emergent LLM key wired in for Gemini 3 Flash.

## Prioritized Backlog
### P1 — Next
- Real YouTube Data API v3 integration for actual video metadata + comment fetching (currently AI-synthesized from model knowledge).
- Save/favorite places (needs auth).
- Map view for city browsing.
- Share-a-verdict social preview cards (og:image generation).

### P2
- User submissions / community voting.
- Trip planner: bundle places into an itinerary.
- Filter by price range + open-now.
- Multi-language verdicts.

## Next Action Items
1. Ship an optional YouTube Data API key input in Settings to switch from AI-synthesized to real-source verdicts.
2. Consider affiliate revenue: hotel bookings + restaurant reservation links per detail page.

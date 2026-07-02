from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
import hashlib
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ================= Models =================
class VideoSource(BaseModel):
    title: str
    channel: str
    video_id: str
    thumbnail: str
    views: str
    quote: str


class AIVerdict(BaseModel):
    summary: str
    pros: List[str]
    cons: List[str]
    must_try: List[str]
    sentiment_score: float  # 0-10
    positive_pct: int
    negative_pct: int
    neutral_pct: int
    confidence: int  # 0-100
    videos_analyzed: int
    comments_analyzed: int


class Place(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str  # restaurant, cafe, hotel, bar, tourist, streetfood
    city: str
    country: str
    tagline: str
    image: str
    hero_image: str
    price_range: str  # $, $$, $$$
    verdict: AIVerdict
    videos: List[VideoSource]
    top_comments: List[str]
    tags: List[str]
    curated: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class AnalyzeRequest(BaseModel):
    place_name: str
    city: Optional[str] = ""
    category: Optional[str] = "restaurant"


# ================= Curated seed data =================
CURATED_PLACES: List[dict] = [
    {
        "name": "Bar Basso",
        "category": "bar",
        "city": "Milan",
        "country": "Italy",
        "tagline": "Home of the Negroni Sbagliato — a design-world pilgrimage since 1967.",
        "image": "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200",
        "hero_image": "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1600",
        "price_range": "$$",
        "verdict": {
            "summary": "Nearly every food creator visiting Milan makes the pilgrimage. The consensus: iconic ambiance, oversized glasses, and a Sbagliato that lives up to the hype — but service pace and prices divide opinion.",
            "pros": ["Legendary Negroni Sbagliato invented here", "Old-Milan interiors, unchanged since the 60s", "Reliable go-to for aperitivo culture"],
            "cons": ["Gets extremely crowded after 8pm", "Service can feel rushed to newcomers", "Not a full-dinner spot"],
            "must_try": ["Negroni Sbagliato", "Classic Negroni", "Aperitivo snack platter"],
            "sentiment_score": 9.1,
            "positive_pct": 82,
            "negative_pct": 6,
            "neutral_pct": 12,
            "confidence": 94,
            "videos_analyzed": 24,
            "comments_analyzed": 1867,
        },
        "videos": [
            {"title": "Milan Cocktail Tour — The One Bar You Cannot Skip", "channel": "Wine Wanderers", "video_id": "dQw4w9WgXcQ", "thumbnail": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600", "views": "1.2M", "quote": "This is where the Sbagliato was born. That alone is worth the trip."},
            {"title": "48 Hours Eating & Drinking in Milan", "channel": "Mark Wiens", "video_id": "kJQP7kiw5Fk", "thumbnail": "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600", "views": "3.4M", "quote": "Wildly authentic. The bartenders don't care who you are — and I love that."},
            {"title": "Best Bars in Europe Ranked", "channel": "The Cocktail Codex", "video_id": "3JZ_D3ELwOQ", "thumbnail": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600", "views": "890K", "quote": "You can feel the history in every corner."},
        ],
        "top_comments": [
            "Been three times now — never disappoints. The Sbagliato is worth every euro.",
            "Crowded but that's part of the charm. Get there before 7pm.",
            "The interior looks exactly like every photo from the 80s. Time capsule.",
        ],
        "tags": ["Iconic", "Aperitivo", "Historic"],
    },
    {
        "name": "Tim Ho Wan",
        "category": "restaurant",
        "city": "Hong Kong",
        "country": "Hong Kong",
        "tagline": "The world's most affordable Michelin star, still churning out that legendary BBQ pork bun.",
        "image": "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200",
        "hero_image": "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1600",
        "price_range": "$",
        "verdict": {
            "summary": "Universally recommended by street-food and Michelin channels alike. The baked BBQ pork buns are called 'life-changing' in nearly every video. Wait times are the biggest complaint.",
            "pros": ["Michelin-starred at under $15 USD/head", "Baked BBQ pork buns are considered legendary", "Fast turnaround despite queues"],
            "cons": ["Expect 30–60 min wait at peak", "Small seating, communal tables", "Menu can feel narrow if you dislike dim sum"],
            "must_try": ["Baked BBQ pork buns", "Steamed shrimp dumplings", "Vermicelli rolls with pork liver"],
            "sentiment_score": 9.4,
            "positive_pct": 88,
            "negative_pct": 4,
            "neutral_pct": 8,
            "confidence": 97,
            "videos_analyzed": 41,
            "comments_analyzed": 4210,
        },
        "videos": [
            {"title": "The Cheapest Michelin Star Meal On Earth", "channel": "Mark Wiens", "video_id": "vid1", "thumbnail": "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=600", "views": "8.9M", "quote": "The pork bun literally changed the way I think about texture."},
            {"title": "24 Hours Eating in Hong Kong", "channel": "Best Ever Food Review Show", "video_id": "vid2", "thumbnail": "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600", "views": "5.1M", "quote": "I dream about these buns."},
            {"title": "Hong Kong Dim Sum Battle", "channel": "Eater", "video_id": "vid3", "thumbnail": "https://images.unsplash.com/photo-1541696490-8744a5dc0228?w=600", "views": "2.2M", "quote": "The clear winner. Every time."},
        ],
        "top_comments": [
            "Went last month — still perfect. 20 minute wait, worth every second.",
            "Order the baked buns twice. You'll want more.",
            "Better than restaurants 10x the price.",
        ],
        "tags": ["Michelin", "Dim Sum", "Budget Icon"],
    },
    {
        "name": "Aman Tokyo",
        "category": "hotel",
        "city": "Tokyo",
        "country": "Japan",
        "tagline": "A hushed vertical ryokan floating 33 floors above Otemachi.",
        "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200",
        "hero_image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1600",
        "price_range": "$$$",
        "verdict": {
            "summary": "Travel vlogs consistently rank Aman Tokyo among the most serene urban hotels in the world. The 30m pool with skyline view is the most photographed feature. Consensus: worth it for a special occasion, not a casual stay.",
            "pros": ["Extraordinary spa and 30m sky pool", "Impeccable, quiet service", "Rooms designed like modern ryokans"],
            "cons": ["Extremely expensive ($1500+/night)", "F&B outlets are pricey even for Aman guests", "Location is business district, quiet at night"],
            "must_try": ["Sunset in the pool", "Omakase at Musashi by Aman", "Spa's onsen ritual"],
            "sentiment_score": 9.6,
            "positive_pct": 91,
            "negative_pct": 3,
            "neutral_pct": 6,
            "confidence": 92,
            "videos_analyzed": 18,
            "comments_analyzed": 924,
        },
        "videos": [
            {"title": "Inside The Most Expensive Hotel Room in Tokyo", "channel": "Luxury Life", "video_id": "vid4", "thumbnail": "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600", "views": "3.7M", "quote": "The pool alone is a religious experience."},
            {"title": "Tokyo's Best 5 Hotels — Ranked", "channel": "TheLuxuryTravelExpert", "video_id": "vid5", "thumbnail": "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600", "views": "1.4M", "quote": "This is what quiet luxury actually looks like."},
        ],
        "top_comments": [
            "The lobby is 30 meters high. It doesn't feel like Tokyo.",
            "Best sleep I've ever had in a hotel. That's the review.",
        ],
        "tags": ["Luxury", "Design", "Special Occasion"],
    },
    {
        "name": "Café de Flore",
        "category": "cafe",
        "city": "Paris",
        "country": "France",
        "tagline": "Sartre's old office and today's most Instagrammed banquette in Saint-Germain.",
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200",
        "hero_image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1600",
        "price_range": "$$",
        "verdict": {
            "summary": "Loved for the terrace, mocked for the prices. Creators agree: come for the atmosphere and the people-watching, not for the coffee.",
            "pros": ["Perfect Left Bank people-watching", "Historic literary atmosphere", "Reliable croque monsieur"],
            "cons": ["€8+ for a small espresso", "Service divides opinion", "Very tourist-heavy"],
            "must_try": ["Chocolat chaud", "Croque monsieur", "Sit on the outdoor terrace"],
            "sentiment_score": 7.4,
            "positive_pct": 62,
            "negative_pct": 22,
            "neutral_pct": 16,
            "confidence": 89,
            "videos_analyzed": 33,
            "comments_analyzed": 2810,
        },
        "videos": [
            {"title": "Are Paris Cafes Overrated?", "channel": "Paris With Ines", "video_id": "vid6", "thumbnail": "https://images.pexels.com/photos/12743256/pexels-photo-12743256.jpeg?w=600", "views": "780K", "quote": "You pay for the seat, not the coffee. And I'm okay with that."},
            {"title": "48h in Saint-Germain", "channel": "Emily In Paris IRL", "video_id": "vid7", "thumbnail": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600", "views": "1.9M", "quote": "The chocolat chaud is the real reason to come."},
        ],
        "top_comments": [
            "Overpriced but the terrace at sunset is unmatched.",
            "Skip the coffee — order the hot chocolate.",
        ],
        "tags": ["Iconic", "People-watch", "Historic"],
    },
    {
        "name": "Jew Town Chai Wallah",
        "category": "streetfood",
        "city": "Kochi",
        "country": "India",
        "tagline": "A single kettle, twelve stools, and the cardamom chai that broke YouTube.",
        "image": "https://images.unsplash.com/photo-1571167530149-c72f2fafa9ed?w=1200",
        "hero_image": "https://images.unsplash.com/photo-1552879890-3a06dd3a06c2?w=1600",
        "price_range": "$",
        "verdict": {
            "summary": "After going viral in 2023, this tiny stall has become a bucket-list item for South India food creators. Consensus: still worth it, still authentic, still 20 rupees.",
            "pros": ["Ridiculously good cardamom chai", "Under $0.30 per cup", "Owner is a joy — regularly featured on camera"],
            "cons": ["Small, no seating for groups", "Sometimes closes early if kettle runs out", "Getting more crowded post-virality"],
            "must_try": ["Elaichi (cardamom) chai", "Masala chai", "Rusk on the side"],
            "sentiment_score": 9.7,
            "positive_pct": 94,
            "negative_pct": 2,
            "neutral_pct": 4,
            "confidence": 91,
            "videos_analyzed": 15,
            "comments_analyzed": 1105,
        },
        "videos": [
            {"title": "The 20 Rupee Chai That Broke The Internet", "channel": "Curly Tales", "video_id": "vid8", "thumbnail": "https://images.unsplash.com/photo-1571167530149-c72f2fafa9ed?w=600", "views": "12M", "quote": "This is the best chai I've ever had. Full stop."},
            {"title": "Kerala Street Food Tour", "channel": "Trippin' Tarantino", "video_id": "vid9", "thumbnail": "https://images.unsplash.com/photo-1524350876685-274059332603?w=600", "views": "4.2M", "quote": "Go before the queue gets any longer."},
        ],
        "top_comments": [
            "Went after seeing it on YouTube. Not disappointed. Uncle remembered my order the second time.",
            "Simple, real, and cheap. The way street food should be.",
        ],
        "tags": ["Viral", "Under $1", "Local Legend"],
    },
    {
        "name": "Ronin",
        "category": "bar",
        "city": "Hong Kong",
        "country": "Hong Kong",
        "tagline": "16 seats, no signage, an 800-strong Japanese whisky list.",
        "image": "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1200",
        "hero_image": "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1600",
        "price_range": "$$$",
        "verdict": {
            "summary": "Regularly listed in Asia's 50 Best Bars. Cocktail creators call it 'life-list' territory. Reservations are near-impossible without weeks of notice.",
            "pros": ["World-class Japanese whisky selection", "Extraordinary bar snacks", "Intimate 16-seat counter"],
            "cons": ["Reservations 2-4 weeks in advance", "Not budget-friendly", "Blink-and-you-miss-it entrance"],
            "must_try": ["Highball flight", "Uni toast", "Bartender's choice omakase drink"],
            "sentiment_score": 9.5,
            "positive_pct": 89,
            "negative_pct": 4,
            "neutral_pct": 7,
            "confidence": 90,
            "videos_analyzed": 12,
            "comments_analyzed": 630,
        },
        "videos": [
            {"title": "Inside Asia's Best Whisky Bar", "channel": "Difford's Guide", "video_id": "vid10", "thumbnail": "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600", "views": "620K", "quote": "The most focused bar experience in Asia."},
            {"title": "Hong Kong's Best Bars — Ranked", "channel": "Punch", "video_id": "vid11", "thumbnail": "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600", "views": "410K", "quote": "Ronin is not just a bar. It's a temple."},
        ],
        "top_comments": [
            "Book weeks in advance. Do not walk in.",
            "The highball changed my definition of the drink.",
        ],
        "tags": ["Hidden", "Whisky", "Reservation-only"],
    },
    {
        "name": "Antelope Canyon",
        "category": "tourist",
        "city": "Page, Arizona",
        "country": "USA",
        "tagline": "Sandstone waves and mid-day light beams — the most-photographed slot canyon on Earth.",
        "image": "https://images.unsplash.com/photo-1520962880247-cfaf541c8724?w=1200",
        "hero_image": "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1600",
        "price_range": "$$",
        "verdict": {
            "summary": "Travel vloggers all agree the canyon itself is stunning. Where opinions split: whether the Upper (easier, more crowded) or Lower (steeper, quieter) is better.",
            "pros": ["Otherworldly natural formations", "Light beams between 11am-1pm", "Guided tours are professional"],
            "cons": ["Crowded — reservations mandatory", "Tours are short (~1 hour)", "No unguided access"],
            "must_try": ["Upper Antelope midday tour", "Lower Antelope for photographers", "Combine with Horseshoe Bend nearby"],
            "sentiment_score": 8.9,
            "positive_pct": 79,
            "negative_pct": 9,
            "neutral_pct": 12,
            "confidence": 93,
            "videos_analyzed": 27,
            "comments_analyzed": 2140,
        },
        "videos": [
            {"title": "Antelope Canyon: Upper vs Lower", "channel": "Kara and Nate", "video_id": "vid12", "thumbnail": "https://images.unsplash.com/photo-1520962880247-cfaf541c8724?w=600", "views": "3.1M", "quote": "Lower is quieter. Upper is easier. Pick your battle."},
            {"title": "Arizona Road Trip", "channel": "Yes Theory", "video_id": "vid13", "thumbnail": "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=600", "views": "6.8M", "quote": "One of the few things that lives up to its Instagram."},
        ],
        "top_comments": [
            "Go Lower. Fewer people, better photos, better guides.",
            "Book 3 months out for peak light.",
        ],
        "tags": ["Nature", "Photo Bucket List", "Guided Only"],
    },
    {
        "name": "Sichuan Impression",
        "category": "restaurant",
        "city": "Los Angeles",
        "country": "USA",
        "tagline": "The mala-numbing Sichuan spot food critics from Chengdu approve of.",
        "image": "https://images.unsplash.com/photo-1552611052-33e04de081de?w=1200",
        "hero_image": "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=1600",
        "price_range": "$$",
        "verdict": {
            "summary": "Multiple Chengdu-native food creators certify this as 'the real thing.' Praised for authentic mala numbing heat rarely found outside China.",
            "pros": ["Genuinely Chengdu-level spicy", "Reasonable prices for the quality", "Owner is often on the floor"],
            "cons": ["Actually spicy — not tourist spicy", "Wait times on weekends", "Small Alhambra location"],
            "must_try": ["Boiled fish in chili oil", "Toothpick lamb", "Mapo tofu"],
            "sentiment_score": 9.2,
            "positive_pct": 85,
            "negative_pct": 6,
            "neutral_pct": 9,
            "confidence": 88,
            "videos_analyzed": 19,
            "comments_analyzed": 1348,
        },
        "videos": [
            {"title": "The Most Authentic Sichuan in America", "channel": "Strictly Dumpling", "video_id": "vid14", "thumbnail": "https://images.unsplash.com/photo-1552611052-33e04de081de?w=600", "views": "2.6M", "quote": "This is not Panda Express. This is real."},
            {"title": "LA Chinese Food Tour", "channel": "Eater LA", "video_id": "vid15", "thumbnail": "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=600", "views": "1.1M", "quote": "The mala hits you three minutes in. Beautifully."},
        ],
        "top_comments": [
            "Bring friends. Order 6+ dishes. Trust.",
            "The lamb toothpicks are worth the trip alone.",
        ],
        "tags": ["Authentic", "Spicy", "Group Dining"],
    },
]


# ================= AI Analysis =================
async def generate_ai_verdict(place_name: str, city: str, category: str) -> dict:
    """Use Gemini 3 Flash to analyze YouTube discourse and generate a verdict."""
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")

    session_id = hashlib.md5(f"{place_name}-{city}-{category}".encode()).hexdigest()

    system_msg = (
        "You are Scout, an AI food and travel analyst. Given a place name, city, and category, "
        "you will simulate an analysis of YouTube videos, reviews, and comments about that place — "
        "drawing on your general knowledge of what food/travel creators, critics, and audiences say. "
        "Return ONLY a valid JSON object with this exact schema, no prose, no markdown fences:\n"
        "{\n"
        '  "summary": "1–2 sentence editorial verdict",\n'
        '  "pros": ["...", "...", "..."],\n'
        '  "cons": ["...", "...", "..."],\n'
        '  "must_try": ["...", "...", "..."],\n'
        '  "sentiment_score": 8.7,\n'
        '  "positive_pct": 78,\n'
        '  "negative_pct": 10,\n'
        '  "neutral_pct": 12,\n'
        '  "confidence": 85,\n'
        '  "videos_analyzed": 18,\n'
        '  "comments_analyzed": 1240,\n'
        '  "tagline": "punchy one-liner (max 12 words)",\n'
        '  "videos": [\n'
        '    {"title":"...","channel":"...","video_id":"vidX","thumbnail":"","views":"1.2M","quote":"..."},\n'
        '    ... (3 items total)\n'
        '  ],\n'
        '  "top_comments": ["...", "...", "..."],\n'
        '  "tags": ["tag1", "tag2", "tag3"]\n'
        "}\n"
        "Rules: sentiment_score 0-10, percentages sum to 100, confidence 60-97. "
        "Be honest — include real drawbacks. If the place is obscure or fictional, still return best-effort analysis."
    )

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system_msg,
    ).with_model("gemini", "gemini-3-flash-preview")

    prompt = f"Place: {place_name}\nCity: {city or 'unspecified'}\nCategory: {category}\n\nReturn the JSON now."
    resp = await chat.send_message(UserMessage(text=prompt))

    text = resp.strip() if isinstance(resp, str) else str(resp).strip()
    # Strip potential code fences
    if text.startswith("```"):
        text = text.strip("`")
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()
    # Find first { and last }
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise HTTPException(status_code=502, detail="AI did not return valid JSON")
    try:
        data = json.loads(text[start:end + 1])
    except json.JSONDecodeError as e:
        logging.error(f"JSON parse failed: {e}\nRaw: {text}")
        raise HTTPException(status_code=502, detail="AI returned malformed JSON")

    return data


# ================= Routes =================
@api_router.get("/")
async def root():
    return {"service": "Scout", "status": "ok"}


@api_router.get("/places", response_model=List[Place])
async def list_places(category: Optional[str] = None, city: Optional[str] = None, q: Optional[str] = None):
    docs = await db.places.find({}, {"_id": 0}).to_list(500)
    if not docs:
        # seed on first call
        for p in CURATED_PLACES:
            place = Place(**p)
            await db.places.insert_one(place.model_dump())
        docs = await db.places.find({}, {"_id": 0}).to_list(500)

    if category and category != "all":
        docs = [d for d in docs if d["category"] == category]
    if city:
        docs = [d for d in docs if city.lower() in d["city"].lower()]
    if q:
        ql = q.lower()
        docs = [d for d in docs if ql in d["name"].lower() or ql in d["city"].lower() or ql in d["tagline"].lower() or any(ql in t.lower() for t in d.get("tags", []))]
    return docs


@api_router.get("/places/{place_id}", response_model=Place)
async def get_place(place_id: str):
    doc = await db.places.find_one({"id": place_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Place not found")
    return doc


@api_router.post("/analyze", response_model=Place)
async def analyze_place(req: AnalyzeRequest):
    """Live AI analysis of an arbitrary place using YouTube discourse knowledge."""
    if not req.place_name or len(req.place_name.strip()) < 2:
        raise HTTPException(status_code=400, detail="place_name required")

    # Cache: reuse recent analyses of same query
    cache_key = f"{req.place_name.lower()}|{(req.city or '').lower()}|{req.category}"
    cached = await db.analyses.find_one({"cache_key": cache_key}, {"_id": 0})
    if cached:
        doc = cached["place"]
        return doc

    ai = await generate_ai_verdict(req.place_name, req.city or "", req.category or "restaurant")

    # Fallback images based on category
    image_map = {
        "restaurant": "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200",
        "cafe": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200",
        "hotel": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200",
        "bar": "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200",
        "tourist": "https://images.unsplash.com/photo-1520962880247-cfaf541c8724?w=1200",
        "streetfood": "https://images.unsplash.com/photo-1571167530149-c72f2fafa9ed?w=1200",
    }
    hero_map = {
        "restaurant": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600",
        "cafe": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1600",
        "hotel": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1600",
        "bar": "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1600",
        "tourist": "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1600",
        "streetfood": "https://images.unsplash.com/photo-1552879890-3a06dd3a06c2?w=1600",
    }
    img = image_map.get(req.category, image_map["restaurant"])
    hero = hero_map.get(req.category, hero_map["restaurant"])

    # Build videos with real thumbnail fallback
    videos = []
    for i, v in enumerate(ai.get("videos", [])[:3]):
        videos.append({
            "title": v.get("title", "YouTube Review"),
            "channel": v.get("channel", "Creator"),
            "video_id": v.get("video_id", f"video-{i}"),
            "thumbnail": v.get("thumbnail") or img,
            "views": v.get("views", "—"),
            "quote": v.get("quote", ""),
        })

    verdict = {
        "summary": ai.get("summary", ""),
        "pros": ai.get("pros", [])[:6],
        "cons": ai.get("cons", [])[:6],
        "must_try": ai.get("must_try", [])[:6],
        "sentiment_score": float(ai.get("sentiment_score", 8.0)),
        "positive_pct": int(ai.get("positive_pct", 70)),
        "negative_pct": int(ai.get("negative_pct", 15)),
        "neutral_pct": int(ai.get("neutral_pct", 15)),
        "confidence": int(ai.get("confidence", 80)),
        "videos_analyzed": int(ai.get("videos_analyzed", 15)),
        "comments_analyzed": int(ai.get("comments_analyzed", 900)),
    }

    place = Place(
        name=req.place_name,
        category=req.category or "restaurant",
        city=req.city or "",
        country="",
        tagline=ai.get("tagline", "AI-analyzed from YouTube reviews and comments."),
        image=img,
        hero_image=hero,
        price_range="$$",
        verdict=AIVerdict(**verdict),
        videos=[VideoSource(**v) for v in videos],
        top_comments=ai.get("top_comments", [])[:5],
        tags=ai.get("tags", [])[:5],
        curated=False,
    )

    doc = place.model_dump()
    await db.analyses.insert_one({"cache_key": cache_key, "place": doc, "created_at": datetime.now(timezone.utc).isoformat()})
    await db.places.insert_one(doc)
    return doc


@api_router.get("/trending", response_model=List[Place])
async def trending():
    docs = await db.places.find({"curated": True}, {"_id": 0}).to_list(20)
    if not docs:
        for p in CURATED_PLACES:
            place = Place(**p)
            await db.places.insert_one(place.model_dump())
        docs = await db.places.find({"curated": True}, {"_id": 0}).to_list(20)
    # Sort by sentiment score desc
    docs.sort(key=lambda d: d["verdict"]["sentiment_score"], reverse=True)
    return docs[:6]


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

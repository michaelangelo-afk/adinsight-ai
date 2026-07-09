// lib/influencer/mock-data.ts
//
// Phase 4 — 12 creators spread across Lagos / Abuja / Ibadan /
// Port Harcourt; niches Food / Tech / Beauty / Fitness / Travel /
// Education / Fashion / B2B / Lifestyle / Wellness.
//
// Determinism: every numeric value is hand-picked (not Math.random()),
// so the same data renders on SSR and on first client render. No
// hydration mismatch. Audience, content-mix, and ER history are tuned
// so the fit-score (lib/influencer/fit-score.ts) returns a meaningful
// spread — not all "78%" with one outlier.
//
// Brand resolve (consumer of fit-score.ts) is the "Lagos Bites"
// advertiser from lib/mock-data.ts (restaurant, ₦350k monthly budget).
// Brand-niche weights are [Food: 0.55, Lifestyle: 0.25, Wellness: 0.20]
// — see fit-score.ts for how this propagates.

import type {
  AudienceDemographics,
  City,
  ContentKind,
  ContentMixEntry,
  ExtendedInfluencer,
  Niche
} from "./types";

/** Geo weights for the brand (Lagos Bites) — what cities matter. */
export const BRAND_GEO_WEIGHTS: Record<City, number> = {
  Lagos: 0.55,
  Abuja: 0.2,
  Ibadan: 0.1,
  "Port Harcourt": 0.15
};

/** Brand niche preference weights — must sum to ~1. */
export const BRAND_NICHE_WEIGHTS: Record<Niche, number> = {
  Food: 0.55,
  Lifestyle: 0.25,
  Wellness: 0.2,
  Tech: 0,
  Beauty: 0,
  Fitness: 0,
  Travel: 0,
  Education: 0,
  Career: 0,
  Fashion: 0,
  B2B: 0
};

/** Band budget baseline for the brand — per creator cap (₦/month). */
export const BRAND_BUDGET_CAP = 200_000;

interface CreatorSeed {
  id: string;
  fullName: string;
  handle: string;
  city: City;
  niches: Niche[];
  followerCount: number;
  engagementRate: number;
  basePrice: number;
  platforms: ExtendedInfluencer["platforms"];
  isVerified: boolean;
  rating: number;
  avatar: string;
  recentDelta: number;
  audienceNiche: Niche[];
  audience: AudienceDemographics;
  contentMix: ContentMixEntry[];
  historicalEr: number[];
  samplePosts: Array<{
    kind: ContentKind;
    seed: string;
    er: number;
    postedAt: string;
  }>;
}

/**
 * Seed table. Values picked so fit-score resolves to a clean distribution
 * for the default brand (one poor-fit, several mid, two-three high-fit).
 * Keep this table readable — it IS the source of truth for the
 * influencer analytics demo.
 */
const SEEDS: CreatorSeed[] = [
  // 1 — best fit: Lagos food creator with a Lagos-heavy food audience.
  {
    id: "inf_01",
    fullName: "Tomi Ogunleye",
    handle: "@tomi.eats",
    city: "Lagos",
    niches: ["Food", "Lifestyle"],
    followerCount: 38_400,
    engagementRate: 0.062,
    basePrice: 145_000,
    platforms: ["instagram", "tiktok"],
    isVerified: true,
    rating: 4.9,
    avatar: "TO",
    recentDelta: 0.18,
    audienceNiche: ["Food", "Lifestyle", "Wellness"],
    audience: {
      ageBands: {
        "13-17": 0.06,
        "18-24": 0.34,
        "25-34": 0.38,
        "35-44": 0.16,
        "45+": 0.06
      },
      gender: { female: 0.62, male: 0.32, other: 0.06 },
      topCities: [
        { city: "Lagos", share: 0.55 },
        { city: "Abuja", share: 0.14 },
        { city: "Port Harcourt", share: 0.11 },
        { city: "Ibadan", share: 0.05 }
      ]
    },
    contentMix: [
      { kind: "reel", share: 0.45 },
      { kind: "carousel", share: 0.22 },
      { kind: "story", share: 0.25 },
      { kind: "static", share: 0.08 }
    ],
    historicalEr: [
      0.041, 0.044, 0.048, 0.05, 0.052, 0.055, 0.057, 0.058, 0.06, 0.061, 0.06,
      0.062
    ],
    samplePosts: [
      {
        kind: "reel",
        seed: "🍝",
        er: 0.084,
        postedAt: "2026-07-02T14:02:00Z"
      },
      {
        kind: "carousel",
        seed: "🥘",
        er: 0.061,
        postedAt: "2026-06-29T09:31:00Z"
      },
      {
        kind: "story",
        seed: "🍴",
        er: 0.105,
        postedAt: "2026-06-26T19:14:00Z"
      }
    ]
  },
  // 2 — high-fit: Lagos wellness + lifestyle, slightly higher price.
  {
    id: "inf_02",
    fullName: "Aisha Mohammed",
    handle: "@aisha.travels",
    city: "Abuja",
    niches: ["Travel", "Lifestyle", "Wellness"],
    followerCount: 19_200,
    engagementRate: 0.071,
    basePrice: 110_000,
    platforms: ["instagram", "youtube", "tiktok"],
    isVerified: true,
    rating: 4.9,
    avatar: "AM",
    recentDelta: 0.14,
    audienceNiche: ["Travel", "Lifestyle", "Wellness", "Food"],
    audience: {
      ageBands: {
        "13-17": 0.04,
        "18-24": 0.32,
        "25-34": 0.42,
        "35-44": 0.17,
        "45+": 0.05
      },
      gender: { female: 0.74, male: 0.22, other: 0.04 },
      topCities: [
        { city: "Abuja", share: 0.42 },
        { city: "Lagos", share: 0.34 },
        { city: "Port Harcourt", share: 0.08 },
        { city: "Ibadan", share: 0.04 }
      ]
    },
    contentMix: [
      { kind: "reel", share: 0.32 },
      { kind: "long", share: 0.28 },
      { kind: "carousel", share: 0.2 },
      { kind: "story", share: 0.2 }
    ],
    historicalEr: [
      0.052, 0.055, 0.058, 0.061, 0.064, 0.066, 0.067, 0.068, 0.069, 0.07, 0.07,
      0.071
    ],
    samplePosts: [
      {
        kind: "reel",
        seed: "🌅",
        er: 0.092,
        postedAt: "2026-07-01T11:14:00Z"
      },
      {
        kind: "long",
        seed: "🍲",
        er: 0.078,
        postedAt: "2026-06-25T16:22:00Z"
      },
      {
        kind: "carousel",
        seed: "🥗",
        er: 0.068,
        postedAt: "2026-06-21T08:14:00Z"
      }
    ]
  },
  // 3 — high-fit but budget-stretched: Beauty niche, expensive follower base.
  {
    id: "inf_03",
    fullName: "Chidinma Nwosu",
    handle: "@chidi.beauty",
    city: "Lagos",
    niches: ["Beauty", "Fashion"],
    followerCount: 47_900,
    engagementRate: 0.045,
    basePrice: 165_000,
    platforms: ["instagram", "tiktok"],
    isVerified: true,
    rating: 4.6,
    avatar: "CN",
    recentDelta: 0.06,
    audienceNiche: ["Beauty", "Fashion", "Lifestyle"],
    audience: {
      ageBands: {
        "13-17": 0.1,
        "18-24": 0.4,
        "25-34": 0.32,
        "35-44": 0.12,
        "45+": 0.06
      },
      gender: { female: 0.86, male: 0.1, other: 0.04 },
      topCities: [
        { city: "Lagos", share: 0.51 },
        { city: "Abuja", share: 0.18 },
        { city: "Port Harcourt", share: 0.09 },
        { city: "Ibadan", share: 0.05 }
      ]
    },
    contentMix: [
      { kind: "reel", share: 0.36 },
      { kind: "static", share: 0.24 },
      { kind: "story", share: 0.32 },
      { kind: "carousel", share: 0.08 }
    ],
    historicalEr: [
      0.052, 0.05, 0.048, 0.047, 0.046, 0.045, 0.045, 0.044, 0.045, 0.044, 0.044,
      0.045
    ],
    samplePosts: [
      {
        kind: "reel",
        seed: "💄",
        er: 0.062,
        postedAt: "2026-06-30T13:50:00Z"
      },
      {
        kind: "static",
        seed: "👗",
        er: 0.04,
        postedAt: "2026-06-26T09:00:00Z"
      }
    ]
  },
  // 4 — mid-fit: B2B tech creator, wrong niche but right city (geographic lift).
  {
    id: "inf_04",
    fullName: "Ifeanyi Iroegbu",
    handle: "@ifeanyi.tech",
    city: "Lagos",
    niches: ["Tech", "B2B"],
    followerCount: 12_800,
    engagementRate: 0.087,
    basePrice: 95_000,
    platforms: ["twitter", "instagram"],
    isVerified: true,
    rating: 4.8,
    avatar: "II",
    recentDelta: 0.24,
    audienceNiche: ["Tech", "B2B", "Education"],
    audience: {
      ageBands: {
        "13-17": 0.02,
        "18-24": 0.28,
        "25-34": 0.5,
        "35-44": 0.15,
        "45+": 0.05
      },
      gender: { female: 0.34, male: 0.62, other: 0.04 },
      topCities: [
        { city: "Lagos", share: 0.58 },
        { city: "Abuja", share: 0.18 },
        { city: "Port Harcourt", share: 0.07 },
        { city: "Ibadan", share: 0.04 }
      ]
    },
    contentMix: [
      { kind: "long", share: 0.42 },
      { kind: "carousel", share: 0.28 },
      { kind: "static", share: 0.18 },
      { kind: "story", share: 0.12 }
    ],
    historicalEr: [
      0.06, 0.064, 0.068, 0.072, 0.074, 0.078, 0.08, 0.082, 0.084, 0.085, 0.086,
      0.087
    ],
    samplePosts: [
      {
        kind: "long",
        seed: "💻",
        er: 0.104,
        postedAt: "2026-07-02T08:30:00Z"
      },
      {
        kind: "carousel",
        seed: "🧠",
        er: 0.082,
        postedAt: "2026-06-29T10:18:00Z"
      }
    ]
  },
  // 5 — mid-fit: Ibadan fitness creator with a small but loyal audience.
  {
    id: "inf_05",
    fullName: "Olalekan Bello",
    handle: "@ola.fits",
    city: "Ibadan",
    niches: ["Fitness", "Wellness"],
    followerCount: 8_400,
    engagementRate: 0.094,
    basePrice: 60_000,
    platforms: ["instagram", "twitter"],
    isVerified: false,
    rating: 4.5,
    avatar: "OB",
    recentDelta: 0.31,
    audienceNiche: ["Fitness", "Wellness", "Food"],
    audience: {
      ageBands: {
        "13-17": 0.08,
        "18-24": 0.42,
        "25-34": 0.34,
        "35-44": 0.12,
        "45+": 0.04
      },
      gender: { female: 0.44, male: 0.52, other: 0.04 },
      topCities: [
        { city: "Ibadan", share: 0.4 },
        { city: "Lagos", share: 0.28 },
        { city: "Abuja", share: 0.1 },
        { city: "Port Harcourt", share: 0.04 }
      ]
    },
    contentMix: [
      { kind: "reel", share: 0.5 },
      { kind: "static", share: 0.22 },
      { kind: "story", share: 0.18 },
      { kind: "carousel", share: 0.1 }
    ],
    historicalEr: [
      0.06, 0.066, 0.07, 0.074, 0.078, 0.08, 0.084, 0.086, 0.088, 0.09, 0.092,
      0.094
    ],
    samplePosts: [
      {
        kind: "reel",
        seed: "💪",
        er: 0.12,
        postedAt: "2026-07-03T06:45:00Z"
      },
      {
        kind: "static",
        seed: "🥗",
        er: 0.094,
        postedAt: "2026-06-30T17:00:00Z"
      }
    ]
  },
  // 6 — mid-fit: Abuja B2B education creator.
  {
    id: "inf_06",
    fullName: "Bisi Adeyemi",
    handle: "@bisi.speaks",
    city: "Abuja",
    niches: ["Education", "Career"],
    followerCount: 22_600,
    engagementRate: 0.054,
    basePrice: 78_000,
    platforms: ["instagram", "youtube"],
    isVerified: true,
    rating: 4.7,
    avatar: "BA",
    recentDelta: 0.09,
    audienceNiche: ["Education", "B2B", "Career"],
    audience: {
      ageBands: {
        "13-17": 0.05,
        "18-24": 0.3,
        "25-34": 0.4,
        "35-44": 0.18,
        "45+": 0.07
      },
      gender: { female: 0.58, male: 0.38, other: 0.04 },
      topCities: [
        { city: "Abuja", share: 0.46 },
        { city: "Lagos", share: 0.32 },
        { city: "Port Harcourt", share: 0.07 },
        { city: "Ibadan", share: 0.05 }
      ]
    },
    contentMix: [
      { kind: "long", share: 0.38 },
      { kind: "carousel", share: 0.3 },
      { kind: "reel", share: 0.2 },
      { kind: "story", share: 0.12 }
    ],
    historicalEr: [
      0.046, 0.048, 0.05, 0.05, 0.051, 0.052, 0.052, 0.053, 0.053, 0.054, 0.054,
      0.054
    ],
    samplePosts: [
      {
        kind: "long",
        seed: "🎤",
        er: 0.072,
        postedAt: "2026-07-01T10:00:00Z"
      },
      {
        kind: "carousel",
        seed: "📚",
        er: 0.058,
        postedAt: "2026-06-27T12:30:00Z"
      }
    ]
  },
  // 7 — niche lift: Lagos food creator with smaller audience.
  {
    id: "inf_07",
    fullName: "Kunle Adebayo",
    handle: "@kunle.kitchen",
    city: "Lagos",
    niches: ["Food"],
    followerCount: 14_200,
    engagementRate: 0.078,
    basePrice: 72_000,
    platforms: ["instagram", "tiktok"],
    isVerified: false,
    rating: 4.7,
    avatar: "KA",
    recentDelta: 0.22,
    audienceNiche: ["Food", "Lifestyle"],
    audience: {
      ageBands: {
        "13-17": 0.05,
        "18-24": 0.36,
        "25-34": 0.4,
        "35-44": 0.14,
        "45+": 0.05
      },
      gender: { female: 0.5, male: 0.46, other: 0.04 },
      topCities: [
        { city: "Lagos", share: 0.6 },
        { city: "Abuja", share: 0.13 },
        { city: "Port Harcourt", share: 0.08 },
        { city: "Ibadan", share: 0.05 }
      ]
    },
    contentMix: [
      { kind: "reel", share: 0.5 },
      { kind: "carousel", share: 0.22 },
      { kind: "story", share: 0.18 },
      { kind: "static", share: 0.1 }
    ],
    historicalEr: [
      0.06, 0.063, 0.068, 0.07, 0.072, 0.073, 0.074, 0.075, 0.076, 0.077, 0.077,
      0.078
    ],
    samplePosts: [
      {
        kind: "reel",
        seed: "🍲",
        er: 0.094,
        postedAt: "2026-07-02T17:00:00Z"
      },
      {
        kind: "reel",
        seed: "🍰",
        er: 0.085,
        postedAt: "2026-06-30T11:30:00Z"
      }
    ]
  },
  // 8 — niche fit: Ibadan wellness creator.
  {
    id: "inf_08",
    fullName: "Folake Adebisi",
    handle: "@folake.flow",
    city: "Ibadan",
    niches: ["Wellness", "Lifestyle"],
    followerCount: 6_800,
    engagementRate: 0.082,
    basePrice: 48_000,
    platforms: ["instagram"],
    isVerified: false,
    rating: 4.6,
    avatar: "FA",
    recentDelta: 0.28,
    audienceNiche: ["Wellness", "Lifestyle", "Food"],
    audience: {
      ageBands: {
        "13-17": 0.05,
        "18-24": 0.4,
        "25-34": 0.36,
        "35-44": 0.13,
        "45+": 0.06
      },
      gender: { female: 0.78, male: 0.18, other: 0.04 },
      topCities: [
        { city: "Ibadan", share: 0.34 },
        { city: "Lagos", share: 0.36 },
        { city: "Abuja", share: 0.12 },
        { city: "Port Harcourt", share: 0.04 }
      ]
    },
    contentMix: [
      { kind: "reel", share: 0.4 },
      { kind: "carousel", share: 0.32 },
      { kind: "static", share: 0.16 },
      { kind: "story", share: 0.12 }
    ],
    historicalEr: [
      0.06, 0.064, 0.07, 0.072, 0.075, 0.077, 0.078, 0.08, 0.08, 0.081, 0.081,
      0.082
    ],
    samplePosts: [
      {
        kind: "reel",
        seed: "🧘",
        er: 0.108,
        postedAt: "2026-07-01T07:00:00Z"
      },
      {
        kind: "carousel",
        seed: "🥑",
        er: 0.084,
        postedAt: "2026-06-28T12:30:00Z"
      }
    ]
  },
  // 9 — Port Harcourt travel / lifestyle mid-fit.
  {
    id: "inf_09",
    fullName: "Damilola Ojo",
    handle: "@dammy.discover",
    city: "Port Harcourt",
    niches: ["Travel", "Lifestyle"],
    followerCount: 11_500,
    engagementRate: 0.065,
    basePrice: 68_000,
    platforms: ["instagram", "tiktok"],
    isVerified: false,
    rating: 4.6,
    avatar: "DO",
    recentDelta: 0.16,
    audienceNiche: ["Travel", "Lifestyle", "Food"],
    audience: {
      ageBands: {
        "13-17": 0.06,
        "18-24": 0.36,
        "25-34": 0.4,
        "35-44": 0.12,
        "45+": 0.06
      },
      gender: { female: 0.54, male: 0.42, other: 0.04 },
      topCities: [
        { city: "Port Harcourt", share: 0.4 },
        { city: "Lagos", share: 0.32 },
        { city: "Abuja", share: 0.12 },
        { city: "Ibadan", share: 0.04 }
      ]
    },
    contentMix: [
      { kind: "reel", share: 0.42 },
      { kind: "carousel", share: 0.28 },
      { kind: "story", share: 0.2 },
      { kind: "static", share: 0.1 }
    ],
    historicalEr: [
      0.05, 0.053, 0.057, 0.058, 0.06, 0.061, 0.062, 0.063, 0.064, 0.064, 0.065,
      0.065
    ],
    samplePosts: [
      {
        kind: "reel",
        seed: "🏞️",
        er: 0.082,
        postedAt: "2026-06-30T16:00:00Z"
      },
      {
        kind: "carousel",
        seed: "🌴",
        er: 0.067,
        postedAt: "2026-06-26T08:00:00Z"
      }
    ]
  },
  // 10 — poor fit: Lagos fashion-only creator (no food audience overlap).
  {
    id: "inf_10",
    fullName: "Zainab Yusuf",
    handle: "@zainab.runway",
    city: "Lagos",
    niches: ["Fashion"],
    followerCount: 31_200,
    engagementRate: 0.039,
    basePrice: 142_000,
    platforms: ["instagram", "tiktok"],
    isVerified: true,
    rating: 4.5,
    avatar: "ZY",
    recentDelta: -0.04,
    audienceNiche: ["Fashion", "Beauty"],
    audience: {
      ageBands: {
        "13-17": 0.14,
        "18-24": 0.5,
        "25-34": 0.26,
        "35-44": 0.07,
        "45+": 0.03
      },
      gender: { female: 0.9, male: 0.06, other: 0.04 },
      topCities: [
        { city: "Lagos", share: 0.5 },
        { city: "Abuja", share: 0.17 },
        { city: "Port Harcourt", share: 0.09 },
        { city: "Ibadan", share: 0.05 }
      ]
    },
    contentMix: [
      { kind: "reel", share: 0.36 },
      { kind: "static", share: 0.36 },
      { kind: "story", share: 0.2 },
      { kind: "carousel", share: 0.08 }
    ],
    historicalEr: [
      0.054, 0.052, 0.05, 0.048, 0.046, 0.044, 0.043, 0.042, 0.041, 0.04, 0.04,
      0.039
    ],
    samplePosts: [
      {
        kind: "reel",
        seed: "👠",
        er: 0.045,
        postedAt: "2026-06-30T19:00:00Z"
      },
      {
        kind: "static",
        seed: "👜",
        er: 0.036,
        postedAt: "2026-06-27T14:00:00Z"
      }
    ]
  },
  // 11 — Budget-stretched: high-follower food creator we can't afford.
  {
    id: "inf_11",
    fullName: "Tope Bakare",
    handle: "@tope.tables",
    city: "Lagos",
    niches: ["Food", "Travel"],
    followerCount: 89_400,
    engagementRate: 0.041,
    basePrice: 425_000,
    platforms: ["instagram", "tiktok", "youtube"],
    isVerified: true,
    rating: 4.7,
    avatar: "TB",
    recentDelta: 0.04,
    audienceNiche: ["Food", "Travel", "Lifestyle"],
    audience: {
      ageBands: {
        "13-17": 0.06,
        "18-24": 0.32,
        "25-34": 0.4,
        "35-44": 0.16,
        "45+": 0.06
      },
      gender: { female: 0.6, male: 0.36, other: 0.04 },
      topCities: [
        { city: "Lagos", share: 0.5 },
        { city: "Abuja", share: 0.18 },
        { city: "Port Harcourt", share: 0.1 },
        { city: "Ibadan", share: 0.06 }
      ]
    },
    contentMix: [
      { kind: "long", share: 0.3 },
      { kind: "reel", share: 0.32 },
      { kind: "carousel", share: 0.18 },
      { kind: "story", share: 0.2 }
    ],
    historicalEr: [
      0.046, 0.045, 0.044, 0.043, 0.042, 0.042, 0.041, 0.041, 0.041, 0.041, 0.041,
      0.041
    ],
    samplePosts: [
      {
        kind: "long",
        seed: "🍽️",
        er: 0.05,
        postedAt: "2026-06-29T11:00:00Z"
      },
      {
        kind: "reel",
        seed: "🥂",
        er: 0.046,
        postedAt: "2026-06-25T17:00:00Z"
      }
    ]
  },
  // 12 — Edge case: low-FIT but high momentum — could pyramid up next quarter.
  {
    id: "inf_12",
    fullName: "Emeka Eze",
    handle: "@emeka.food",
    city: "Abuja",
    niches: ["Food"],
    followerCount: 4_600,
    engagementRate: 0.105,
    basePrice: 32_000,
    platforms: ["instagram"],
    isVerified: false,
    rating: 4.4,
    avatar: "EE",
    recentDelta: 0.42,
    audienceNiche: ["Food"],
    audience: {
      ageBands: {
        "13-17": 0.08,
        "18-24": 0.46,
        "25-34": 0.32,
        "35-44": 0.1,
        "45+": 0.04
      },
      gender: { female: 0.42, male: 0.54, other: 0.04 },
      topCities: [
        { city: "Abuja", share: 0.58 },
        { city: "Lagos", share: 0.2 },
        { city: "Port Harcourt", share: 0.06 },
        { city: "Ibadan", share: 0.02 }
      ]
    },
    contentMix: [
      { kind: "reel", share: 0.6 },
      { kind: "static", share: 0.18 },
      { kind: "story", share: 0.16 },
      { kind: "carousel", share: 0.06 }
    ],
    historicalEr: [
      0.06, 0.066, 0.074, 0.08, 0.086, 0.09, 0.094, 0.098, 0.1, 0.102, 0.104,
      0.105
    ],
    samplePosts: [
      {
        kind: "reel",
        seed: "🍛",
        er: 0.13,
        postedAt: "2026-07-02T19:30:00Z"
      },
      {
        kind: "static",
        seed: "🌶",
        er: 0.099,
        postedAt: "2026-06-29T20:00:00Z"
      }
    ]
  }
];

/** Convert seeds → ExtendedInfluencer[] with deterministic ER delta. */
function buildCreator(s: CreatorSeed): ExtendedInfluencer {
  return {
    id: s.id,
    fullName: s.fullName,
    handle: s.handle,
    niche: s.niches,
    city: s.city,
    followerCount: s.followerCount,
    engagementRate: s.engagementRate,
    basePrice: s.basePrice,
    platforms: s.platforms,
    isVerified: s.isVerified,
    rating: s.rating,
    avatar: s.avatar,
    recentDelta: s.recentDelta,
    audience: s.audience,
    contentMix: s.contentMix,
    samplePosts: s.samplePosts.map((p, i) => ({
      id: `${s.id}-post-${i}`,
      kind: p.kind,
      thumbnailSeed: p.seed,
      er: p.er,
      postedAt: p.postedAt
    })),
    historicalEr: {
      series: s.historicalEr,
      delta: s.historicalEr[s.historicalEr.length - 1] - s.historicalEr[0]
    },
    audienceNiche: s.audienceNiche,
    cpmByFollower: Math.round((s.basePrice / s.followerCount) * 1000)
  };
}

export const extendedInfluencers: ExtendedInfluencer[] = SEEDS.map(buildCreator);

/** Pretty labels for the heatmap (creator × niche matrix). */
export const HEATMAP_NICHES = [
  "Food",
  "Lifestyle",
  "Wellness",
  "Travel",
  "Beauty",
  "Fashion",
  "Tech",
  "B2B",
  "Education",
  "Fitness"
] as const;

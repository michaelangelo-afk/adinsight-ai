/**
 * Assisted publishing — the compliant replacement for browser automation.
 *
 * For channels with no write API (Jiji, Nairaland, Marketplace) or where a
 * human should press publish (WhatsApp status, marketplace seller portals),
 * GrowthAds generates the listing kit and opens the platform's own composer.
 * The owner publishes. Nothing here logs in, scrapes or posts.
 *
 * Pure functions only: no React, no network, no storage. That keeps the copy
 * rules testable and lets the UI preview exactly what will be pasted.
 */

export type AssistedChannelId =
  | "jiji"
  | "nairaland"
  | "facebook-marketplace"
  | "whatsapp"
  | "jumia"
  | "konga";

export interface AssistedChannelSpec {
  id: AssistedChannelId;
  name: string;
  /** The platform's own composer. Opened in a new tab; never driven. */
  composerUrl: string;
  composerLabel: string;
  titleMax: number;
  bodyMax: number;
  supportsPrice: boolean;
  supportsPhotos: boolean;
  supportsBanner: boolean;
  /** Fields the wizard should show for this channel. */
  fields: Array<"title" | "description" | "price" | "location" | "phone" | "category" | "url">;
  checklist: string[];
  warnings: string[];
  spec: string;
}

export const ASSISTED_CHANNELS: AssistedChannelSpec[] = [
  {
    id: "jiji",
    name: "Jiji",
    composerUrl: "https://jiji.ng/sell",
    composerLabel: "Open Jiji sell form",
    titleMax: 70,
    bodyMax: 3000,
    supportsPrice: true,
    supportsPhotos: true,
    supportsBanner: false,
    fields: ["title", "description", "price", "location", "phone", "category", "url"],
    checklist: [
      "Use 5+ clear photos on a plain background; the first one is the thumbnail.",
      "Pick the exact category before writing the title.",
      "Put a real price, not “DM for price”.",
      "Answer chats within an hour; Jiji ranks responsive sellers higher."
    ],
    warnings: [
      "Jiji Terms 7.13.13 prohibit links to competing marketplaces — keep your link for the chat, not the listing body."
    ],
    spec: "Free listing · 5+ photos · price required · Boost/Pro Sales optional"
  },
  {
    id: "nairaland",
    name: "Nairaland",
    composerUrl: "https://www.nairaland.com/campaign",
    composerLabel: "Open Nairaland campaign",
    titleMax: 30,
    bodyMax: 600,
    supportsPrice: false,
    supportsPhotos: false,
    supportsBanner: true,
    fields: ["title", "description", "location", "url"],
    checklist: [
      "Export the banner at 318×106 px (or 636×212 for retina), JPG or PNG, under 100KB.",
      "Show the business name, logo or domain in the banner.",
      "Fund at least ₦5,000 of ad credit before placing.",
      "Choose one relevant section; there are six advertiser slots per section."
    ],
    warnings: [
      "Nairaland is a banner product, not a forum post. Do not post ads in boards; the anti-spam bot bans accounts.",
      "Rates are fixed by section and change with demand. Health was ₦9,927/month in September 2026."
    ],
    spec: "318×106 banner · ≤100KB · 6 slots/section · ₦5,000 minimum credit"
  },
  {
    id: "facebook-marketplace",
    name: "Facebook Marketplace",
    composerUrl: "https://www.facebook.com/marketplace/create/listing",
    composerLabel: "Open Marketplace listing",
    titleMax: 100,
    bodyMax: 2000,
    supportsPrice: true,
    supportsPhotos: true,
    supportsBanner: false,
    fields: ["title", "description", "price", "location", "phone", "category", "url"],
    checklist: [
      "Use natural photos, not a catalogue render; Marketplace rewards real listings.",
      "Add the neighbourhood, not just the city.",
      "Post the same item to 3–5 local buy/sell groups.",
      "Reply in Messenger; the first 10 minutes decide the ranking."
    ],
    warnings: [
      "Marketplace suppresses external links in the listing body — send the URL in chat instead.",
      "No listing API exists for third parties; the owner must press publish."
    ],
    spec: "Free listing · photos · local pickup · no third-party API"
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    composerUrl: "https://wa.me/",
    composerLabel: "Share on WhatsApp",
    titleMax: 60,
    bodyMax: 700,
    supportsPrice: true,
    supportsPhotos: false,
    supportsBanner: false,
    fields: ["title", "description", "price", "location", "phone", "url"],
    checklist: [
      "Post the text as a Status first; it is free and reaches existing contacts.",
      "Send to customers who opted in, not scraped numbers.",
      "Use a utility template for order updates (≈₦9); keep marketing templates for real offers (≈₦69).",
      "Keep the 72-hour Click-to-WhatsApp window in mind before sending a template."
    ],
    warnings: [
      "WhatsApp Web automation violates the terms and risks the number. Copy/paste or use the Cloud API.",
      "Marketing templates require approval; a mixed order-update-plus-offer template is classified as marketing."
    ],
    spec: "Free status · 1,000 free service msgs/number/month · marketing ≈₦69"
  },
  {
    id: "jumia",
    name: "Jumia",
    composerUrl: "https://sellercenter.jumia.com.ng/",
    composerLabel: "Open Jumia seller centre",
    titleMax: 255,
    bodyMax: 4000,
    supportsPrice: true,
    supportsPhotos: true,
    supportsBanner: false,
    fields: ["title", "description", "price", "category", "url"],
    checklist: [
      "Match the product name to the category's required format.",
      "Use a white-background main image; Jumia rejects busy ones.",
      "Set stock and dispatch lead time before going live.",
      "Check commission and fulfilment fees before pricing."
    ],
    warnings: [
      "Retail media and sponsored placements are sales-led; there is no self-serve ads API."
    ],
    spec: "Seller centre · commission + fulfilment · sponsored placements sales-led"
  },
  {
    id: "konga",
    name: "Konga",
    composerUrl: "https://www.konga.com/sell-on-konga",
    composerLabel: "Open Konga seller page",
    titleMax: 255,
    bodyMax: 4000,
    supportsPrice: true,
    supportsPhotos: true,
    supportsBanner: false,
    fields: ["title", "description", "price", "category", "url"],
    checklist: [
      "Create the seller account before preparing the listing.",
      "Use a clean main image and the exact category.",
      "Confirm commission and delivery terms.",
      "Keep stock counts accurate; cancellations hurt the seller score."
    ],
    warnings: [
      "No public campaign API; sponsored placements are sales-led."
    ],
    spec: "Seller portal · commission · sponsored placements sales-led"
  }
];

export const ASSISTED_CHANNEL_IDS = ASSISTED_CHANNELS.map((c) => c.id);

export interface ListingInput {
  business: string;
  title: string;
  description: string;
  price: string;
  location: string;
  phone: string;
  url: string;
  category: string;
}

export const EMPTY_LISTING: ListingInput = {
  business: "",
  title: "",
  description: "",
  price: "",
  location: "Lagos",
  phone: "",
  url: "",
  category: ""
};

export interface AssistKit {
  channelId: AssistedChannelId;
  channelName: string;
  title: string;
  body: string;
  hashtags: string;
  link: string;
  /** Ready-to-paste text: title, body, hashtags and link. */
  copy: string;
  composerUrl: string;
  checklist: string[];
  warnings: string[];
  spec: string;
  titleCount: number;
  bodyCount: number;
  titleMax: number;
  bodyMax: number;
}

export function assistedChannel(id: AssistedChannelId): AssistedChannelSpec {
  const found = ASSISTED_CHANNELS.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown assisted channel: ${id}`);
  return found;
}

function clean(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
}

function truncate(value: string, max: number): string {
  const text = clean(value);
  if (text.length <= max) return text;
  return text.slice(0, Math.max(0, max - 1)).trimEnd() + "…";
}

/** ₦12,000 from "12000", "12,000" or "₦12,000"; leaves text prices alone. */
export function formatNaira(value: string): string {
  const raw = clean(value);
  if (!raw) return "";
  const numeric = Number(raw.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) return raw;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(numeric);
}

function normaliseUrl(value: string): string {
  const raw = clean(value);
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

/** Adds UTM tags so assisted launches can be measured without a platform API. */
export function withUtm(
  value: string,
  channel: string,
  campaign = "assisted_launch"
): string {
  const raw = normaliseUrl(value);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    url.searchParams.set("utm_source", channel);
    url.searchParams.set("utm_medium", "assisted");
    url.searchParams.set("utm_campaign", campaign);
    return url.toString();
  } catch {
    return raw;
  }
}

function hashtagsFor(input: ListingInput, include: boolean): string {
  if (!include) return "";
  const tags = [input.category, input.location]
    .map((v) => clean(v).replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, ""))
    .filter(Boolean)
    .map((v) => `#${v}`);
  if (input.location.trim().toLowerCase() !== "nigeria") tags.push("#Nigeria");
  return Array.from(new Set(tags)).slice(0, 4).join(" ");
}

function fallbackTitle(input: ListingInput): string {
  const business = clean(input.business);
  const description = clean(input.description);
  if (business && description) return `${business} — ${description}`;
  return business || description || "Your offer";
}

function jijiBody(input: ListingInput, link: string): string {
  const lines = [
    clean(input.description),
    "",
    input.price.trim() ? `Price: ${formatNaira(input.price)}` : "",
    input.location.trim() ? `Location: ${clean(input.location)}` : "",
    input.phone.trim() ? `Call/WhatsApp: ${clean(input.phone)}` : "",
    input.category.trim() ? `Category: ${clean(input.category)}` : "",
    link ? `More: ${link}` : ""
  ];
  return lines.filter((line, i) => line !== "" || (i > 0 && lines[i - 1] !== "")).join("\n").trim();
}

function marketplaceBody(input: ListingInput, link: string): string {
  return [
    clean(input.description),
    "",
    input.price.trim() ? `Price: ${formatNaira(input.price)}` : "",
    input.location.trim() ? `Location: ${clean(input.location)}` : "",
    input.category.trim() ? `Category: ${clean(input.category)}` : "",
    input.phone.trim() ? `Call/WhatsApp: ${clean(input.phone)}` : "",
    link ? `More details in chat: ${link}` : ""
  ]
    .filter(Boolean)
    .join("\n")
    .trim();
}

function whatsappBody(input: ListingInput, link: string): string {
  return [
    `*${truncate(fallbackTitle(input), 60)}*`,
    clean(input.description),
    input.price.trim() ? `Price: ${formatNaira(input.price)}` : "",
    input.location.trim() ? `Location: ${clean(input.location)}` : "",
    input.phone.trim() ? `Chat: ${clean(input.phone)}` : "",
    link
  ]
    .filter(Boolean)
    .join("\n")
    .trim();
}

function nairalandBody(input: ListingInput, link: string): string {
  return [
    `Banner headline: ${truncate(fallbackTitle(input), 30)}`,
    `Subline: ${truncate(clean(input.description) || `${clean(input.business)} in ${clean(input.location)}`, 50)}`,
    `CTA: ${truncate(input.category ? `Visit ${clean(input.business)}` : "Learn more", 18)}`,
    `Landing URL: ${link || "(add your website in the form)"}`
  ].join("\n");
}

function sellerCentreBody(input: ListingInput, link: string): string {
  return [
    `Product: ${clean(input.title) || fallbackTitle(input)}`,
    input.price.trim() ? `Price: ${formatNaira(input.price)}` : "",
    input.category.trim() ? `Category: ${clean(input.category)}` : "",
    "",
    clean(input.description),
    link ? `\nMore: ${link}` : ""
  ]
    .filter(Boolean)
    .join("\n")
    .trim();
}

export function buildKit(id: AssistedChannelId, input: ListingInput): AssistKit {
  const spec = assistedChannel(id);
  const title = truncate(clean(input.title) || fallbackTitle(input), spec.titleMax);
  const link = withUtm(input.url, id);
  const hashtags = hashtagsFor(input, id === "whatsapp" || id === "facebook-marketplace");

  let body = "";
  switch (id) {
    case "jiji":
      body = jijiBody(input, link);
      break;
    case "facebook-marketplace":
      body = marketplaceBody(input, link);
      break;
    case "whatsapp":
      body = whatsappBody(input, link);
      break;
    case "nairaland":
      body = nairalandBody(input, link);
      break;
    case "jumia":
    case "konga":
      body = sellerCentreBody(input, link);
      break;
  }

  body = truncate(body, spec.bodyMax);
  const copy = [title, body, hashtags].filter(Boolean).join("\n\n").trim();

  const warnings = [...spec.warnings];
  if (spec.fields.includes("phone") && !input.phone.trim()) {
    warnings.push("Add a phone or WhatsApp number; buyers skip listings without one.");
  }
  if (spec.supportsPrice && !input.price.trim()) {
    warnings.push("Add a price; “DM for price” reduces replies and ranking.");
  }
  if (spec.fields.includes("url") && !input.url.trim()) {
    warnings.push("Add a landing URL so this launch can be measured with UTMs.");
  }

  return {
    channelId: id,
    channelName: spec.name,
    title,
    body,
    hashtags,
    link,
    copy,
    composerUrl:
      id === "whatsapp"
        ? `https://wa.me/?text=${encodeURIComponent(copy)}`
        : spec.composerUrl,
    checklist: spec.checklist,
    warnings,
    spec: spec.spec,
    titleCount: title.length,
    bodyCount: body.length,
    titleMax: spec.titleMax,
    bodyMax: spec.bodyMax
  };
}

/** Plain-text export for the “Download kit” button. */
export function kitToText(kit: AssistKit): string {
  return [
    `${kit.channelName} — assisted launch`,
    "",
    `Title (${kit.titleCount}/${kit.titleMax}):`,
    kit.title,
    "",
    `Body (${kit.bodyCount}/${kit.bodyMax}):`,
    kit.body,
    kit.hashtags ? `\nHashtags:\n${kit.hashtags}` : "",
    kit.link ? `\nTracked link:\n${kit.link}` : "",
    "",
    `Spec: ${kit.spec}`,
    "",
    "Checklist:",
    ...kit.checklist.map((item) => `- ${item}`),
    kit.warnings.length ? "\nBefore you publish:" : "",
    ...kit.warnings.map((item) => `- ${item}`)
  ]
    .filter((line) => line !== "")
    .join("\n")
    .trim();
}

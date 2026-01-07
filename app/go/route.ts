import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import OutboundClick from "@/models/OutboundClick";
import Wishlist from "@/models/Wishlist";

// -------------------- helpers --------------------
function hostBase(hostname: string) {
  // прибираємо "www.", "m.", "smile."
  return hostname.replace(/^(www|m|smile)\./, "").toLowerCase();
}

function addUtm(url: URL) {
  if (!url.searchParams.has("utm_source")) url.searchParams.set("utm_source", "wishlify");
  if (!url.searchParams.has("utm_medium")) url.searchParams.set("utm_medium", "wishlist");
}

function sanitizeForStorage(dest: URL) {
  // зберігаємо без query (менше сміття/персональних параметрів)
  return `${dest.origin}${dest.pathname}`;
}

type AffiliateRule = {
  name: string;
  match: (baseHost: string) => boolean;
  apply: (url: URL) => void;
};

// -------------------- affiliate config --------------------
// ✅ ВКАЗУЄШ тільки ті Amazon домени, де в тебе реально є tracking id.
// Якщо в тебе є тільки US Associates — лишаєш тільки amazon.com
const AMAZON_TAG_BY_HOST: Record<string, string> = {
  "amazon.com": "wishlify-20",

  // Коли заведеш UK/DE — просто додаси:
  // "amazon.co.uk": "wishlify-21",
  // "amazon.de": "wishlifyde-21",
};

const AFFILIATE_RULES: AffiliateRule[] = [
  {
    name: "Amazon Associates (only consider configured countries)",
    match: (h) => Boolean(AMAZON_TAG_BY_HOST[h]),
    apply: (url) => {
      const h = hostBase(url.hostname);
      const tag = AMAZON_TAG_BY_HOST[h];
      if (!tag) return;

      // ✅ перезаписуємо, щоб прибрати чужі tag-и
      url.searchParams.set("tag", tag);
    },
  },

  // приклад: Booking (коли буде id)
  // {
  //   name: "Booking.com",
  //   match: (h) => h === "booking.com",
  //   apply: (url) => url.searchParams.set("aid", "1234567"),
  // },

  // приклад: будь-який магазин з ?ref=
  // {
  //   name: "Example ref",
  //   match: (h) => h === "example.com",
  //   apply: (url) => url.searchParams.set("ref", "mycode"),
  // },
];

function applyAffiliate(dest: URL) {
  const base = hostBase(dest.hostname);
  for (const rule of AFFILIATE_RULES) {
    if (rule.match(base)) {
      rule.apply(dest);
      break; // 1 правило достатньо
    }
  }
}

// -------------------- route --------------------
export async function GET(req: NextRequest) {
  const wishId = req.nextUrl.searchParams.get("wishId");
  const wishlistId = req.nextUrl.searchParams.get("wishlistId");

  // беремо URL тільки з БД
  if (!wishId || !wishlistId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  await connectMongo();

  type WishlistWishPick = { wishes?: Array<{ product_url?: string }> };

  const wl = await Wishlist.findOne(
    { _id: wishlistId, "wishes._id": wishId },
    { "wishes.$": 1 }
  ).lean<WishlistWishPick>();

  const storedUrl = wl?.wishes?.[0]?.product_url;
  if (!storedUrl) return NextResponse.redirect(new URL("/", req.url));

  let dest: URL;
  try {
    dest = new URL(storedUrl);
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (dest.protocol !== "http:" && dest.protocol !== "https:") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // affiliate + utm
  applyAffiliate(dest);
  addUtm(dest);

  // лог (не ламаємо редірект, якщо лог не записався)
  try {
    await OutboundClick.create({
      hostname: dest.hostname,
      url: sanitizeForStorage(dest),
      wish_id: wishId,
      wishlist_id: wishlistId,
      referrer: req.headers.get("referer") ?? undefined,
      user_agent: req.headers.get("user-agent") ?? undefined,
      // можеш додати (якщо є поле в схемі):
      // final_url: dest.toString(),
    });
  } catch (e) {
    console.error("CLICK LOG ERROR", e);
  }

  return NextResponse.redirect(dest.toString(), 302);
}

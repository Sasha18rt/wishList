import type { Metadata } from "next";
import config from "@/config";

const SITE = `https://${config.domainName}`;

const abs = (path = "/") =>
  path.startsWith("http") ? path : `${SITE}${path.startsWith("/") ? path : `/${path}`}`;

type GetSEOTagsInput = Metadata & {
  canonicalUrlRelative?: string;     // e.g. "/wishlist/abc123"
  locale?: string;                   // e.g. "en_US"
  images?: Array<
    | string
    | { url: string; width?: number; height?: number; alt?: string; type?: string }
  >;
  noIndex?: boolean;                 // mark auth/dashboard/etc. pages
  extraTags?: Record<string, any>;
  languagesMap?: Record<string, string>; // i18n alternates, e.g. { "en-US": "/", "lt-LT": "/lt", "uk-UA": "/uk" }
};

export const getSEOTags = ({
  title,
  description,
  keywords,
  openGraph,
  twitter,
  canonicalUrlRelative = "/",
  locale = "en_US",
  images,
  noIndex = false,
  extraTags,
  languagesMap, // optional i18n alternates
}: GetSEOTagsInput = {}): Metadata => {
  const defaultTitle = "Wishlify — Create & Share Wishlists in 60 Seconds";
  const resolvedUrl = abs(canonicalUrlRelative);

  const ogImages =
    images?.map((img) =>
      typeof img === "string"
        ? { url: abs(img), width: 1200, height: 630 }
        : { ...img, url: abs(img.url) }
    ) ??
    openGraph?.images ??
    [
      {
        url: abs("/share.png"),
        width: 1200,
        height: 630,
        alt: "Wishlify — Create and Share Wishlists",
      },
    ];

  const robots: Metadata["robots"] = noIndex
    ? {
        index: false,
        follow: false,
        nocache: true,
        googleBot: { index: false, follow: false, noimageindex: true, nosnippet: true },
      }
    : {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-video-preview": -1,
          "max-snippet": -1,
        },
      };

  return {
    // ----- BASE -----
    metadataBase: new URL(SITE),
    title: typeof title === "string"
      ? { default: defaultTitle, template: "%s • Wishlify" }
      : title ?? { default: defaultTitle, template: "%s • Wishlify" },
    description:
      description ??
      "Create a beautiful wishlist in seconds. Share one link or QR, let friends reserve gifts, and avoid duplicates. Perfect for birthdays, weddings, and Secret Santa.",
    keywords:
      keywords ?? [
        "wishlist app",
        "gift registry",
        "online wishlist",
        "Secret Santa wishlist",
        "share wishlist",
        "wedding registry",
        "baby shower wishlist",
      ],
    applicationName: "Wishlify",
    referrer: "origin-when-cross-origin",
    formatDetection: { telephone: false, address: false, email: false },

    // ----- ICONS / MANIFEST -----
    icons: {
      icon: [{ url: "/favicon-32x32.png", sizes: "32x32" }, { url: "/favicon-16x16.png", sizes: "16x16" }],
      shortcut: "/favicon.ico",
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    manifest: "/site.webmanifest",

    // ----- ALTERNATES (canonical + i18n) -----
    alternates: {
      canonical: canonicalUrlRelative, // Next.js резолвить від metadataBase
      languages: languagesMap,         // напр.: { "en-US": "/", "lt-LT": "/lt", "uk-UA": "/uk" }
    },

   

    // ----- TWITTER -----
    twitter: {
      card: "summary_large_image",
      site: "@wishlify_app",                  // показує від кого сайт
      creator: "@wishlify_app",
      title: twitter?.title ?? defaultTitle,
      description:
        twitter?.description ??
        "No more duplicate or unwanted gifts. Share your wishlist today.",
      images: (twitter?.images as any) ?? [abs("/share.png")],
    },

    // ----- ROBOTS -----
    robots,

    // ----- EXTRA (verification, category, appLinks, etc.) -----
    verification: extraTags?.verification,
    category: "utilities",
    appLinks: extraTags?.appLinks,

    ...extraTags,
  };
};

// ---------- Structured Data ----------
type RenderSchemaInput = {
  org?: {
    name: string;
    url?: string;
    logoUrl?: string;
    sameAs?: string[];
  };
  website?: {
    url?: string;
    searchUrlTemplate?: string; // e.g. "https://wishlify.me/search?q={search_term_string}"
  };
  app?: {
    category?: string;          // e.g. "Utilities" | "Productivity"
    ratingValue?: string;       // "4.8"
    ratingCount?: string | number; // "12"
  };
};

export const renderSchemaTags = ({
  org = { name: "Wishlify", url: SITE, logoUrl: abs("/icon.png"), sameAs: ["https://twitter.com/wishlify_app"] },
  website = { url: SITE },
  app = { category: "Utilities", ratingValue: "4.8", ratingCount: "12" },
}: RenderSchemaInput = {}) => {
  const payload = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: org.name,
      url: org.url ?? SITE,
      logo: org.logoUrl ?? abs("/icon.png"),
      sameAs: org.sameAs ?? [],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Wishlify",
      url: website.url ?? SITE,
      potentialAction: website.searchUrlTemplate
        ? {
            "@type": "SearchAction",
            target: website.searchUrlTemplate,
            "query-input": "required name=search_term_string",
          }
        : {
            "@type": "CreateAction",
            target: `${SITE}/dashboard#create`,
            name: "Create a wishlist",
          },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Wishlify",
      applicationCategory: app.category ?? "Utilities",
      operatingSystem: "All",
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" }, // free to start
      aggregateRating: app.ratingValue && app.ratingCount ? {
        "@type": "AggregateRating",
        ratingValue: app.ratingValue,
        ratingCount: app.ratingCount,
      } : undefined,
      image: abs("/icon.png"),
      url: SITE,
      description:
        "Create and share wishlists in 60 seconds. Friends can reserve gifts to avoid duplicates.",
    },
  ].filter(Boolean);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
};

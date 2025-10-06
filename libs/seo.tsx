import type { Metadata } from "next";
import config from "@/config";

const SITE = `https://${config.domainName}`;
const abs = (path = "/") =>
  path.startsWith("http") ? path : `${SITE}${path.startsWith("/") ? path : `/${path}`}`;

type GetSEOTagsInput = Metadata & {
  canonicalUrlRelative?: string;
  locale?: string;
  images?: Array<
    | string
    | { url: string; width?: number; height?: number; alt?: string; type?: string }
  >;
  noIndex?: boolean;
  extraTags?: Record<string, any>;
  languagesMap?: Record<string, string>;
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
  languagesMap,
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
    metadataBase: new URL(SITE),

    title:
      typeof title === "string"
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

    icons: {
      icon: [
        { url: "/favicon-32x32.png", sizes: "32x32" },
        { url: "/favicon-16x16.png", sizes: "16x16" },
      ],
      shortcut: "/favicon.ico",
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    manifest: "/site.webmanifest",

    alternates: {
      canonical: canonicalUrlRelative,
      languages: languagesMap,
    },

    // 🔥 ПОВЕРНУЛИ Open Graph з картинкою
    openGraph: {
      title: openGraph?.title ?? defaultTitle,
      description:
        openGraph?.description ??
        "Make gifting simple. Create and share wishlists easily and let friends reserve gifts anonymously.",
      url: openGraph?.url ?? resolvedUrl,
      siteName: "Wishlify",
      images: ogImages, // <-- ось тут твоя /share.png
      locale,
      type: "website"
    },

    twitter: {
      card: "summary_large_image",
      site: "@wishlify_app",
      creator: "@wishlify_app",
      title: twitter?.title ?? defaultTitle,
      description:
        twitter?.description ??
        "No more duplicate or unwanted gifts. Share your wishlist today.",
      images: (twitter?.images as any) ?? [abs("/share.png")],
    },

    robots,

    verification: extraTags?.verification,
    category: "utilities",
    appLinks: extraTags?.appLinks,

    ...extraTags,
  };
};

import type { Metadata } from "next";
import config from "@/config";

export const getSEOTags = ({
  title,
  description,
  keywords,
  openGraph,
  canonicalUrlRelative,
  extraTags,
}: Metadata & {
  canonicalUrlRelative?: string;
  extraTags?: Record<string, any>;
} = {}) => {
  return {
    title: title || "Wishlify – Create and Share Wishlists in 60 Seconds",
    description:
      description ||
      "No more unwanted gifts. Create and share your wishlist in seconds with Wishlify. Perfect for birthdays, weddings, and Secret Santa.",
    keywords:
      keywords || [
        "wishlist app",
        "gift registry",
        "online wishlist",
        "Secret Santa wishlist",
        "share wishlist",
      ],
    applicationName: "Wishlify",

    metadataBase: new URL(
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/"
        : `https://${config.domainName}/`
    ),

    openGraph: {
      title:
        openGraph?.title ||
        "Wishlify – Create and Share Wishlists in 60 Seconds",
      description:
        openGraph?.description ||
        "Make gifting simple. Create and share wishlists easily and let friends reserve gifts anonymously.",
      url: openGraph?.url || `https://${config.domainName}/`,
      siteName: "Wishlify",
      images: [
        {
          url: `https://${config.domainName}/share.png`,
          width: 1200,
          height: 630,
          alt: "Wishlify – Create and Share Wishlists",
        },
      ],
      locale: "en_US",
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title:
        openGraph?.title ||
        "Wishlify – Create and Share Wishlists in 60 Seconds",
      description:
        openGraph?.description ||
        "No more duplicate or unwanted gifts. Share your wishlist today.",
      images: [`https://${config.domainName}/share.png`],
      creator: "@wishlify_app",
    },

    ...(canonicalUrlRelative && {
      alternates: { canonical: canonicalUrlRelative },
    }),

    ...extraTags,
  };
};

// Structured Data
export const renderSchemaTags = () => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Wishlify",
          description:
            "Create and share wishlists in 60 seconds. Perfect for birthdays, weddings, and holidays.",
          image: `https://${config.domainName}/icon.png`,
          url: `https://${config.domainName}/`,
          applicationCategory: "Utility",
          operatingSystem: "All",
          author: {
            "@type": "Organization",
            name: "Wishlify",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            ratingCount: "12",
          },
        }),
      }}
    ></script>
  );
};

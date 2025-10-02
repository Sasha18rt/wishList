"use client";

import { useState, useRef, useEffect, useId } from "react";
import type { JSX } from "react";
import Link from "next/link";
import Image from "next/image";

interface Feature {
  title: string;
  description: string | JSX.Element;
  type?: "video" | "image" | "none";
  path?: string;
  format?: string;
  alt?: string;
  svg?: JSX.Element;
  ctaLabel?: string;
  ctaHref?: string;
}

// ——— PRODUCT FEATURES for a wishlist platform ———
const features: Feature[] = [
  {
    title: "All-in-one Dashboard",
    description:
      "One screen for everything: your wishlists, recently viewed items, and your reservations. Quick access to editing and viewing.",
    type: "image",
    path: "/image.png",
    alt: "Dashboard overview",
    ctaLabel: "Open dashboard",
    ctaHref: "/dashboard",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75h7.5v7.5h-7.5zM12.75 3.75h7.5v4.5h-7.5zM12.75 9.75h7.5v10.5h-7.5zM3.75 12.75h7.5v7.5h-7.5z"/>
      </svg>
    ),
  },
 {
  title: "Anonymous Reservations Without Spoilers",
  description:
    "Friends can reserve gifts anonymously. You only see that the item is reserved — no names or details. Zero duplicates, zero spoilers.",
  type: "video", // <-- змінюємо на image
  path: "/res.mp4", // Next.js сам знає що це з public/
  format: "video/mp4",
  ctaLabel: "See how it works",
  ctaHref: "https://wishlify.me/wishlist/67fe9f303b562e4837a288b1",
  svg: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      strokeWidth={1.5}
      stroke="currentColor"
      viewBox="0 0 24 24"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12c1.5-4.5 5.25-7.5 9.75-7.5s8.25 3 9.75 7.5c-1.5 4.5-5.25 7.5-9.75 7.5S3.75 16.5 2.25 12z"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
}
,
  {
    title: "Add a Wish in Seconds",
    description:
      "Paste a link — we’ll fetch the name, photo, and price. Or add manually: notes, priority, deadline. Drag-and-drop photo upload supported.",
     type: "video", // <-- змінюємо на image
  path: "/wish.mp4", // Next.js сам знає що це з public/
  format: "video/mp4",
    alt: "Quick add a wish",
    ctaLabel: "Add a gift",
    ctaHref: "/dashboard",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6"/>
      </svg>
    ),
  },
  
  {
    title: "One-Click Sharing",
    description:
      "Generate a link or QR code and share with friends. No registration needed for guests — just open, view, reserve.",
     type: "video", // <-- змінюємо на image
  path: "/shere1.mp4", // Next.js сам знає що це з public/
  format: "video/mp4",
    alt: "Share wishlist easily",
    ctaLabel: "Share wishlist",
    ctaHref: "/dashboard",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 12a4.5 4.5 0 1 1 4.24-5.74M16.5 12a4.5 4.5 0 1 0-4.24 5.74M8.25 12h7.5"/>
      </svg>
    ),
  },
];


const Item = ({
  feature,
  isOpen,
  onToggle,
  panelId,
  buttonId,
}: {
  index: number;
  feature: Feature;
  isOpen: boolean;
  onToggle: () => void;
  panelId: string;
  buttonId: string;
}) => {
  const accordionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = accordionRef.current;
    if (!el) return;
    if (isOpen) {
      el.style.maxHeight = el.scrollHeight + "px";
      el.style.opacity = "1";
    } else {
      el.style.maxHeight = "0px";
      el.style.opacity = "0";
    }
  }, [isOpen]);

  const { title, description, svg, ctaHref, ctaLabel } = feature;

  return (
    <li>
      <button
        id={buttonId}
        aria-controls={panelId}
        aria-expanded={isOpen}
        className="flex gap-3 items-center w-full py-5 text-base md:text-lg text-left   rounded-md"
        onClick={(e) => {
          e.preventDefault();
          onToggle();
        }}
      >
        <span className={`shrink-0 ${isOpen ? "text-primary" : "text-base-content"}`}>{svg}</span>
        <h3 className={`flex-1 font-medium ${isOpen ? "text-primary" : "text-base-content"}`}>{title}</h3>
      </button>

      <div
        ref={accordionRef}
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className="overflow-hidden transition-all duration-300 ease-in-out text-base-content/90"
        style={{ maxHeight: 0, opacity: 0 }}
      >
        <div className="pb-5 leading-relaxed">
          <div className="prose prose-sm max-w-none dark:prose-invert">{description}</div>
          {ctaHref && ctaLabel && (
            <div className="mt-4">
              <Link href={ctaHref} className="btn btn-primary btn-sm normal-case font-semibold">
                {ctaLabel}
              </Link>
            </div>
          )}
        </div>
      </div>
    </li>
  );
};

const Media = ({ feature }: { feature: Feature }) => {
  const { type, path, format, alt } = feature;
  const style = `
    w-full 
    rounded-xl 
    shadow-lg 
    border 
    border-base-300 
    bg-base-100
  `;

  if (type === "video" && path) {
    return (
      <video
        className={`${style} object-contain sm:object-cover max-h-[500px]`}
        autoPlay
        muted
        loop
        playsInline
        controls
      >
        <source src={path} type={format} />
      </video>
    );
  }
  if (type === "image" && path) {
    return (
      <Image
        src={path}
        alt={alt ?? "Feature preview"}
        width={800}
        height={600}
        className={`${style} object-contain sm:object-cover max-h-[500px]`}
      />
    );
  }
  return <div className={`${style} bg-base-200`}></div>;
};


const FeaturesAccordion = (): JSX.Element => {
  const [featureSelected, setFeatureSelected] = useState<number>(0);
  const sectionId = useId();

  return (
    <section className="py-20 md:py-28 bg-base-300" id="features">
      <div className="max-w-7xl mx-auto px-6">
        <div className="px-6 md:px-8">
          <h2 className="font-extrabold text-4xl lg:text-6xl tracking-tight mb-10 md:mb-16">
            Everything for stress‑free gifting
            <span className="bg-neutral text-neutral-content px-2 md:px-4 ml-1 md:ml-1.5 leading-relaxed whitespace-nowrap">no spoilers</span>
          </h2>
          <div className="flex flex-col md:flex-row gap-10 md:gap-16">
            <div className="grid grid-cols-1 items-stretch gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-14 w-full">
              <ul className="w-full">
                {features.map((feature, i) => {
                  const panelId = `${sectionId}-panel-${i}`;
                  const buttonId = `${sectionId}-button-${i}`;
                  return (
                    <Item
                      key={feature.title}
                      index={i}
                      feature={feature}
                      isOpen={featureSelected === i}
                      onToggle={() => setFeatureSelected(i)}
                      panelId={panelId}
                      buttonId={buttonId}
                    />
                  );
                })}
              </ul>
              <Media feature={features[featureSelected]} key={featureSelected} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesAccordion;
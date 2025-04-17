"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";

export default function ShareWishlistButton() {
  const [isCopied, setIsCopied] = useState(false);
  const pathname = usePathname();

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${pathname}`;

    if (navigator.share && window.innerWidth < 768) {
      try {
        await navigator.share({
          title: "Check out this wishlist!",
          text: "Found this wishlist on Wishlify 👀",
          url: shareUrl,
        });
      } catch (err) {
        toast.error("Share canceled or failed.");
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setIsCopied(false), 1500);
      } catch (err) {
        toast.error("Failed to copy link.");
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="btn btn-ghost btn-circle tooltip tooltip-bottom"
      data-tip={isCopied ? "Copied!" : "Share"}
      aria-label="Share wishlist"
    >
      <span className="btn btn-ghost btn-circle flex items-center justify-center"
      >
        <ExternalLink className="w-5 h-5" />
      </span>
    </button>
  );
}

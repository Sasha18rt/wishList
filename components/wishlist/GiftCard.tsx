"use client";

import React, { useState } from "react";
import clsx from "clsx";
import Link from "next/link";

export interface Wish {
  _id: string;
  name: string;
  description?: string;
  image_url?: string;
  product_url?: string;
  price?: string;
  added_at: string;
}

interface GiftCardProps {
  gift: Wish;
  swipeInfo?: {
    id: string;
    action: "added" | "skipped";
  } | null;
}

const GiftCard: React.FC<GiftCardProps> = ({ gift, swipeInfo }) => {
  const [hoverDir, setHoverDir] = useState<"left" | "right" | null>(null);

  return (
    <div
    className={clsx(
      "relative card bg-base-100 shadow-xl mx-auto select-none touch-none active-cursor",
"w-full max-w-[365px] sm:max-w-md md:max-w-lg lg:max-w-2xl",
      "transition-transform duration-300 hover:scale-[1.03]",
      hoverDir === "left" && "hover:-rotate-2",
      hoverDir === "right" && "hover:rotate-2",
      "h-[580px] rounded-xl overflow-hidden",
      "border border-gray-300 sm:border-0",
      "cursor-pointer sm:cursor-default"
    )}
  
    
      
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        setHoverDir(x < rect.width / 2 ? "left" : "right");
      }}
      onMouseLeave={() => setHoverDir(null)}
    >
      {swipeInfo?.id === gift._id && (
        <div
          className={clsx(
            "absolute top-4 left-4 px-3 py-1.5 rounded-md text-white text-sm font-semibold shadow-md animate-fade-in z-20",
            swipeInfo.action === "added" ? "bg-green-500" : "bg-gray-600"
          )}
        >
          {swipeInfo.action === "added" ? "Added!" : "Skipped"}
        </div>
      )}

      {gift.image_url ? (
        <figure className="h-[100%]">
          <img
            src={gift.image_url}
            alt={gift.name}
            className="object-cover w-full h-full"
            draggable={false}
          />
        </figure>
      ) : (
        <div className="h-[52%] flex items-center justify-center bg-gray-200 text-gray-500">
          No image
        </div>
      )}

      <div className="card-body h-[48%] p-5 pt-4 flex flex-col justify-between">
        <div>
          <h2 className="card-title text-lg font-bold">{gift.name}</h2>

          {gift.description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-4">
              {gift.description}
            </p>
          )}

          {gift.price && gift.price !== "0" && (
            <p className="font-semibold text-base mt-3">
              Price:{" "}
              {isNaN(Number(gift.price)) ? gift.price : `€${gift.price}`}
            </p>
          )}
        </div>

        <div className="mt-4">
          <p className="text-xs text-gray-400">
            Added: {new Date(gift.added_at).toLocaleDateString()}
          </p>

          {gift.product_url && (
            <div className="card-actions mt-2">
              <Link
                href={gift.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-primary w-full"
                onClick={(e) => e.stopPropagation()}
              >
                View Product
              </Link>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default GiftCard;

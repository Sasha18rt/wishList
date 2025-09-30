"use client";

import React, { useState } from "react";
import EditWishlistModal from "./EditWishlistModal";
import { Settings } from "lucide-react";
import type { Wishlist } from "@/app/dashboard/page";

type Props = {
  wishlists: Wishlist[];
  isLoading: boolean;
  setWishlists: React.Dispatch<React.SetStateAction<Wishlist[]>>;
  onSelectWishlist: (id: string) => void;
};

export default function WishlistList({
  wishlists,
  isLoading,
  setWishlists,
  onSelectWishlist,
}: Props) {
  const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Your Wishlists</h2>

      {wishlists.length > 0 ? (
        <ul className="space-y-2">
          {wishlists.map((w) => (
            <li
              key={w._id}
              onClick={() => onSelectWishlist(w._id)}
              className="relative group flex flex-col gap-2 p-4 rounded-xl border border-base-300 
                         bg-base-100 shadow-sm hover:shadow-lg hover:border-primary/50 
                         transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              {/* Edit (іконка зверху справа) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedWishlist(w);
                  setIsModalOpen(true);
                }}
                className="absolute top-3 right-3 text-base-content/60 hover:text-base-content transition-colors"
                aria-label="Edit wishlist"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Info */}
              <div className="space-y-1">
                <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                  {w.title}
                </h3>
                {w.theme && <p className="text-sm text-base-content/70">Theme: {w.theme}</p>}
                {w.visibility && (
                  <p className="text-sm text-base-content/70">Visibility: {w.visibility}</p>
                )}
                {(w.createdAt || w.created_at) && (
                  <p className="text-xs text-base-content/60">
                    Created:{" "}
                    {new Date(w.createdAt ?? w.created_at!).toLocaleDateString()}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center border border-dashed border-base-300 rounded-2xl p-10">
          <h3 className="text-xl font-semibold mb-2">No wishlists yet</h3>
          <p className="text-base-content/70">
            Start by creating your first wishlist.
          </p>
        </div>
      )}

      {selectedWishlist && (
        <EditWishlistModal
          wishlistId={selectedWishlist._id}
          initialTitle={selectedWishlist.title}
          initialTheme={selectedWishlist.theme ?? ""}
          initialVisibility={String(selectedWishlist.visibility ?? "private")}
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          onUpdate={(updated: any) => {
            if ("deleted" in updated && updated.deleted) {
              setWishlists((prev) => prev.filter((x) => x._id !== updated._id));
            } else {
              setWishlists((prev) =>
                prev.map((x) => (x._id === updated._id ? { ...x, ...updated } : x))
              );
            }
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

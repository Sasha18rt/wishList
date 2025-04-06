"use client";
import React from "react";


import { useState, useEffect } from "react";
import EditWishlistModal from "./EditWishlistModal";
import { Settings } from "lucide-react";

interface Wishlist {
  _id: string;
  title: string;
  theme: string;
  visibility: string;
  created_at: string;
}

export default function WishlistList({
  wishlists,
  setWishlists,
  onSelectWishlist,
}: {
  wishlists: Wishlist[];
  setWishlists: React.Dispatch<React.SetStateAction<Wishlist[]>>;
  onSelectWishlist: (id: string) => void;
}) {
  const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [wishlists]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Your Wishlists</h2>
      {loading ? (
        <span className="loading loading-spinner loading-xl"></span>
      ) : !(wishlists.length === 0) ? (
       
        <ul className="space-y-2">
          {wishlists.map((wishlist) => (
            <li
              key={wishlist._id}
              className="relative p-4 border rounded-lg bg-base-100 shadow-md flex flex-col gap-2 transition-all hover:bg-gray-100"
            >
              {/* Settings (edit) button */}
              <button
                onClick={() => {
                  setSelectedWishlist(wishlist);
                  setIsModalOpen(true);
                }}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition-all"
                aria-label="Edit wishlist"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Click to open */}
              <button
                onClick={() => onSelectWishlist(wishlist._id)}
                className="text-left w-full group"
              >
                <h3 className="text-lg font-bold group-hover:text-gray-800 transition-all">
                  {wishlist.title}
                </h3>
                <p className="text-sm group-hover:text-gray-700 transition-all">
                  Theme: {wishlist.theme}
                </p>
                <p className="text-sm group-hover:text-gray-700 transition-all">
                  Visibility: {wishlist.visibility}
                </p>
                <p className="text-xs text-gray-500">
                  Created: {new Date(wishlist.created_at).toLocaleDateString()}
                </p>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Modal for editing */}
      {selectedWishlist && (
        <EditWishlistModal
          wishlistId={selectedWishlist._id}
          initialTitle={selectedWishlist.title}
          initialTheme={selectedWishlist.theme}
          initialVisibility={selectedWishlist.visibility}
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          onUpdate={(updated) => {
            if ("deleted" in updated && updated.deleted) {
              setWishlists((prev) => prev.filter((w) => w._id !== updated._id));
            } else {
              setWishlists((prev) =>
                prev.map((w) => (w._id === updated._id ? updated : w))
              );
            }
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

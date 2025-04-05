"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AddWishModal from "./AddWishModal";
import EditWishModal from "./EditWishModal";
import ShowMoreButton from "./ShowMoreButton"; // import your new component

interface Wish {
  _id: string;
  name: string;
  description?: string;
  image_url?: string;
  product_url?: string;
  price?: string;
  added_at: string;
}

export default function WishList({ wishlistId }: { wishlistId: string }) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
  // Pagination: initial visible count (e.g. 5 wishes)
  const [visibleCount, setVisibleCount] = useState<number>(5);

  useEffect(() => {
    async function fetchWishes() {
      try {
        const response = await fetch(`/api/wishlists/${wishlistId}/wishes`);
        if (!response.ok) throw new Error("Failed to fetch wishes");
        const data = await response.json();
        setWishes(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchWishes();
  }, [wishlistId]);

  const refreshWishes = async () => {
    try {
      const response = await fetch(`/api/wishlists/${wishlistId}/wishes`);
      if (!response.ok) throw new Error("Failed to fetch wishes");
      const data = await response.json();
      setWishes(data);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  if (loading)
    return (
      <p className="text-center text-lg">
        <span className="loading loading-spinner loading-xl"></span>
      </p>
    );
  if (error) return <p className="text-center text-lg text-error">{error}</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Wishes</h2>

      <button
        onClick={() => setIsAddModalOpen(true)}
        className="btn btn-primary w-full"
      >
        + Add New Wish
      </button>

      <ul className="space-y-2">
        {wishes.slice(0, visibleCount).map((wish) => (
          <li
            key={wish._id}
            className="relative p-4 border rounded-lg bg-base-100 shadow-md flex flex-col gap-2 transition-all hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              setSelectedWish(wish);
              setIsEditModalOpen(true);
            }}
          >
            <h3 className="text-lg font-bold transition-all">{wish.name}</h3>
            {wish.description && (
              <p className="text-sm text-gray-600 transition-all">
                {wish.description}
              </p>
            )}
            {wish.image_url && (
              <img
                src={wish.image_url}
                alt={wish.name}
                className="w-full max-h-48 object-cover rounded-md border"
              />
            )}
            {wish.price && wish.price !== "0" && (
              <p className="text-sm font-semibold text-gray-700">
                {isNaN(Number(wish.price)) ? wish.price : `€${wish.price}`}
              </p>
            )}
            {wish.product_url && (
              <a
                href={wish.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="link text-sm text-blue-600 font-medium h-min w-fit"
              >
                View Product
              </a>
            )}
            <p className="text-xs text-gray-500">
              Added: {new Date(wish.added_at).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>

      <ShowMoreButton
        currentCount={visibleCount}
        total={wishes.length}
        onShowMore={() => setVisibleCount(visibleCount + 5)}
      />

      <AddWishModal
        wishlistId={wishlistId}
        isOpen={isAddModalOpen}
        setIsOpen={setIsAddModalOpen}
        onWishAdded={refreshWishes}
      />

      {selectedWish && (
        <EditWishModal
          wishlistId={wishlistId}
          wish={selectedWish}
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          onWishUpdated={refreshWishes}
        />
      )}
    </div>
  );
}

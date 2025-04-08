"use client";
import { useState, useEffect } from "react";
import CreateWishlistModal from "@/components/wishlist/CreateWishlistModal";
import WishlistList from "@/components/wishlist/WishlistList";
import WishlistDetails from "@/components/wishlist/WishlistDetails";
import { useRouter } from "next/navigation";
import { Share2 } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWishlistId, setSelectedWishlistId] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wishlists, setWishlists] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAll() {
      const res = await fetch("/api/wishlists");
      const data = await res.json();
      setWishlists(data);
    }
    fetchAll();
  }, []);

  useEffect(() => {
    if (!selectedWishlistId) {
      setWishlist(null);
      return;
    }

    async function fetchWishlist() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/wishlists/${selectedWishlistId}`);
        if (!response.ok) throw new Error("Wishlist not found");

        const data = await response.json();
        setWishlist(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchWishlist();
  }, [selectedWishlistId]);

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-xl mx-auto space-y-8">
        <h1 className="text-3xl md:text-4xl font-extrabold">Dashboard</h1>
        
        {selectedWishlistId ? (
          <>
            <div className="flex flex-wrap gap-4">
              <button
                className="btn btn-outline"
                onClick={() => setSelectedWishlistId(null)}
              >
                ← Back to Wishlists
              </button>
              <button
                className="btn btn-secondary flex items-center gap-2"
                onClick={() => router.push(`/wishlist/${selectedWishlistId}`)}
              >
                <Share2 className="w-5 h-5" />
                Share Your Wishlist
              </button>
            </div>

            {loading ? (
              <p className="text-center text-lg">
                <span className="loading loading-spinner loading-xl"></span>
              </p>
            ) : error ? (
              <p className="text-center text-lg text-error">{error}</p>
            ) : wishlist ? (
              <WishlistDetails
                wishlistId={selectedWishlistId}
                wishlist={wishlist}
              />
            ) : (
              <p className="text-center text-lg text-error">
                Wishlist data is missing
              </p>
            )}
          </>
        ) : (
          <>
            <WishlistList
              wishlists={wishlists}
              setWishlists={setWishlists}
              onSelectWishlist={setSelectedWishlistId}
            />

            <button
              className="btn btn-primary"
              onClick={() => setIsModalOpen(true)}
            >
              Create Wishlist
            </button>

            <CreateWishlistModal
  isModalOpen={isModalOpen}
  setIsModalOpen={setIsModalOpen}
  onCreated={(newWishlist: any) => {
    setWishlists((prev) => [newWishlist, ...prev]); 
  }}
            />
          </>
        )}
      </section>
    </main>
  );
}

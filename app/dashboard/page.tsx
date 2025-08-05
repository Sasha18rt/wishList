"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CreateWishlistModal from "@/components/wishlist/CreateWishlistModal";
import WishlistList from "@/components/wishlist/WishlistList";

export default function Dashboard() {
  const router = useRouter();

  const [wishlists, setWishlists] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/wishlists");
        if (!res.ok) throw new Error("Failed to load wishlists");
        const data = await res.json();
        setWishlists(data);
      } catch (err: any) {
        console.error("Error fetching wishlists:", err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const handleSelect = (id: string) => {
    router.push(`/wishlist/${id}`);
  };

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-xl mx-auto space-y-8">
        <h1 className="text-3xl md:text-4xl font-extrabold">Dashboard</h1>

        {loading ? (
          <p className="text-center text-lg">
            <span className="loading loading-spinner loading-xl"></span>
          </p>
        ) : error ? (
          <p className="text-center text-lg text-error">{error}</p>
        ) : (
          <WishlistList
            wishlists={wishlists}
            setWishlists={setWishlists}
            onSelectWishlist={handleSelect}
          />
        )}

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
            // prepend newly created wishlist to the list
            setWishlists((prev) => [newWishlist, ...prev]);
          }}
        />
      </section>
    </main>
);
}

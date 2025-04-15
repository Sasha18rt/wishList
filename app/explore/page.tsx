"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";import Link from "next/link";
import toast from "react-hot-toast";
import TinderCard from "react-tinder-card";
import GiftCard, { Wish } from "@/components/wishlist/GiftCard";
import CreateWishlistModal from "@/components/wishlist/CreateWishlistModal";
import SelectWishlistModal from "@/components/wishlist/SelectWishlistModal";
import { useSession } from "next-auth/react";


export default function ExploreGiftsTinder() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [swipeInfo, setSwipeInfo] = useState<{ id: string; action: "added" | "skipped" } | null>(null);
  const childRefs = useRef<React.RefObject<any>[]>([]);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
const [wishlistOptions, setWishlistOptions] = useState<any[]>([]);
const [pendingGiftId, setPendingGiftId] = useState<string | null>(null);
const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
const { data: session } = useSession();
const userId = session?.user?.id;

  useEffect(() => {
    async function fetchWishes() {
      try {
        const res = await fetch("/api/public-wishlists/wishes");
        if (!res.ok) throw new Error("Failed to fetch gifts");
        const data = await res.json();
        setWishes(data);
        childRefs.current = data.map(() => React.createRef());
      } catch (err) {
        setError((err as Error).message);
        toast.error((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchWishes();
  }, []);

  const handleSwipe = (direction: string, gift: Wish) => {
    const action = direction === "right" ? "added" : "skipped";
    setSwipeInfo({ id: gift._id, action });
  
    if (direction === "right") {
      handleAddGift(gift);
    }
  
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setSwipeInfo(null); 
    }, 300);
  };
  

  const handleAddGift = async (gift: Wish) => {
    try {
      if (!session?.user?.id) {
        toast.error("You must be logged in");
        return;
      }
  
      const res = await fetch(`/api/user/${session.user.id}/my-wishlists`);
      const data = await res.json();
  
      if (!res.ok) throw new Error("Failed to load wishlists");
  
      if (data.length === 0) {
        setIsCreateModalOpen(true);
        return;
      }
  
      if (data.length === 1) {
        await addGiftToWishlist(data[0]._id, gift._id);
        toast.success("Gift added!");
        return;
      }
  
      setWishlistOptions(data);
      setPendingGiftId(gift._id);
      setIsSelectModalOpen(true);
    } catch (err) {
      toast.error("Error loading your wishlists");
    }
  };
  
  
  const addGiftToWishlist = async (wishlistId: string, giftId: string) => {
    const res = await fetch("/api/my-wishlist/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wishlistId, giftId }),
    });
  
    if (!res.ok) throw new Error("Failed to add gift");
  };
  
  

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const currentGift = wishes[currentIndex];
      const ref = childRefs.current[currentIndex];
  
      if (!currentGift || !ref) return;
  
      if (event.key === "ArrowRight") {
        ref.current?.swipe("right");
      } else if (event.key === "ArrowLeft") {
        ref.current?.swipe("left");
      }
    },
    [wishes, currentIndex]
  );
  

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (loading) return <p>Loading gifts...</p>;
  if (error) return <p className="text-center text-error">Error: {error}</p>;
  if (wishes.length === 0 || currentIndex >= wishes.length)
    return <p className="text-center">No more gifts!</p>;

  return (
    <div className=" flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mt-12 mb-16 text-center md:mb-26">Explore Gifts</h1>

      <div className="relative w-full max-w-2xl h-[500px] flex justify-center items-center">
  {wishes
    .slice(currentIndex, currentIndex + 3)
    .reverse()
    .map((gift, index, arr) => {
      const realIndex = currentIndex + (arr.length - 1 - index);
      const isTopCard = realIndex === currentIndex;

      if (isTopCard) {
        return (
          <TinderCard
            key={gift._id}
            ref={childRefs.current[realIndex]}
            className="absolute"
            onSwipe={(dir) => handleSwipe(dir, gift)}
            preventSwipe={["up", "down"]}
          >
            <GiftCard gift={gift} swipeInfo={swipeInfo} />
          </TinderCard>
        );
      }

      return (
        <div key={gift._id} className="absolute pointer-events-none scale-95">
        <div className="relative">
          <GiftCard gift={gift} swipeInfo={null} />
        </div>
      </div>
      );
    })}
</div>


      <p className="m-8 text-sm text-gray-500 animate-pulse text-center px-4 pt-8">
        Swipe left to skip, right to add. Or use{" "}
        <kbd className="kbd kbd-xs">←</kbd> /{" "}
        <kbd className="kbd kbd-xs">→</kbd> keys.
      </p>


      <SelectWishlistModal
  isOpen={isSelectModalOpen}
  setIsOpen={setIsSelectModalOpen}
  wishlists={wishlistOptions}
  onSelect={async (wishlistId) => {
    if (!pendingGiftId) return;
    await addGiftToWishlist(wishlistId, pendingGiftId);
    toast.success("Gift added!");
    setPendingGiftId(null);
  }}
/>

<CreateWishlistModal
  isModalOpen={isCreateModalOpen}
  setIsModalOpen={setIsCreateModalOpen}
  onCreated={(newWishlist) => {
    setWishlistOptions([newWishlist]);
    setIsCreateModalOpen(false);
    toast.success("Wishlist created! Now add the gift again.");
  }}
/>

    </div>
  );

}







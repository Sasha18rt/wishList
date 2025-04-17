"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import TinderCard from "react-tinder-card";
import GiftCard, { Wish } from "@/components/wishlist/GiftCard";
import CreateWishlistModal from "@/components/wishlist/CreateWishlistModal";
import SelectWishlistModal from "@/components/wishlist/SelectWishlistModal";
import { useSession } from "next-auth/react";
import { Gift } from "lucide-react";

export default function ExploreGiftsTinder() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [swipeInfo, setSwipeInfo] = useState<{
    id: string;
    action: "added" | "skipped";
  } | null>(null);
  const childRefs = useRef<React.RefObject<any>[]>([]);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [wishlistOptions, setWishlistOptions] = useState<any[]>([]);
  const [pendingGift, setPendingGift] = useState<Wish | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: session } = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    if (window.location.hash === "#scroll") {
      if (window.innerWidth < 768) {
        setTimeout(() => {
          window.scrollBy({ top: 50, behavior: "smooth" });
        }, 200);
      }
    }
  }, []);
  

  
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
      return; 
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
        await addGiftToWishlist(data[0]._id, gift, childRefs.current[currentIndex]);
        return;
      }

      setWishlistOptions(data);
      setPendingGift(gift);
      setIsSelectModalOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Error loading your wishlists");
    }
  };

  const addGiftToWishlist = async (
    wishlistId: string,
    gift: Wish,
    ref?: React.RefObject<any>
  ) => {
    const res = await fetch("/api/my-wishlist/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wishlistId, gift }),
    });
  
    const result = await res.json();
  
    if (res.status === 201) {
      toast.success("Gift added!");
      ref?.current?.swipe("left");
    } else if (
      res.status === 200 &&
      result.message === "Gift already exists in wishlist"
    ) {
      toast.error("Gift already exists in wishlist");
      ref?.current?.swipe("left");
    } else if (!res.ok) {
      toast.error(result.error || "Something went wrong");
    }
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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <p className="text-center">
          Loading gifts{" "}
          <span className="loading loading-spinner loading-xs"></span>
        </p>
      </div>
    );

  if (error) return <p className="text-center text-error">Error: {error}</p>;
  if (wishes.length === 0 || currentIndex >= wishes.length)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <Gift className="w-16 h-16 text-secondary mb-4 animate-bounce" />

        <h2 className="text-2xl font-semibold mb-2">
          You&apos;re all caught up! 🎉
        </h2>
        <p className="text-gray-500 mb-6">
          You&apos;ve browsed all the gifts. Come back later for more
          inspiration!
        </p>

        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Refresh List
        </button>
      </div>
    );

  return (
    <div className=" flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mt-6 mb-16 text-center md:mb-26">
        Explore Gifts
      </h1>

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
              <div
                key={gift._id}
                className="absolute pointer-events-none scale-95"
              >
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
          if (!pendingGift) return;
          await addGiftToWishlist(wishlistId, pendingGift);
          setPendingGift(null);
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

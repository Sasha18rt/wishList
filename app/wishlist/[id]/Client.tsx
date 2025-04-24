"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import EditWishlistModal from "@/components/wishlist/EditWishlistModal";
import EditWishModal from "@/components/wishlist/EditWishModal";
import AddWishModal from "@/components/wishlist/AddWishModal";

import ShowMoreButton from "@/components/wishlist/ShowMoreButton";
import UserProfileModal from "@/components/user/UserProfileModal";
import WishlistHeader from "@/components/wishlist/WishListHeader";
import UserMenu from "@/components/user/UserMenu";
import clsx from "clsx";
import React from "react";


interface WishlistPageProps {
  serverWishlist: any; 
}
interface Wish {
  deleted: any;
  _id: string;
  name: string;
  description?: string;
  image_url?: string;
  product_url?: string;
  price?: string;
  added_at: string;
  isReserved?: boolean;
  reservedBy?: string;
}

interface Reservation {
  wishlist_id: string;
  wish_id: string;
  user_id: string;
  reserved_at: string;
}

interface WishlistData {
  _id: string;
  title: string;
  theme: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    nickname: string;
    image?: string;
  };
  wishes: Wish[];
  reservations?: Reservation[];
  visibility?: string;
  created_at?: string;
}

export default function WishlistPage({ serverWishlist }: WishlistPageProps) {
  const params = useParams();
  
  const wishlistId = params?.id as string;
  const { data: session } = useSession();
  const [wishlist, setWishlist] = useState<WishlistData | null>(serverWishlist);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
  const [isEditWishModalOpen, setIsEditWishModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // State mapping each wish's ID to its reserved user's name
  const [reservationUsers, setReservationUsers] = useState<Record<string, string>>({});
  // State for pagination
  const [visibleCount, setVisibleCount] = useState<number>(5);

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
const [isUserModalOpen, setIsUserModalOpen] = useState(false);


const handleShowUserInfo = async (
  userId: string,
  event?: React.MouseEvent<HTMLButtonElement>
) => {
  event?.currentTarget?.blur();

  try {
    const res = await fetch(`/api/user/${userId}`);
    if (!res.ok) throw new Error("Failed to load user info");

    const user = await res.json();
    setSelectedUser(user);
    setIsUserModalOpen(true);
  } catch (err) {
    toast.error("Cannot load user info");
  }
};

  // Fetch the wishlist data from the public API endpoint
  useEffect(() => {
    async function fetchWishlist() {
      try {
        const res = await fetch(`/api/public-wishlists/${wishlistId}`);
        if (!res.ok) {
          const errorData = await res.json(); 
          throw new Error(errorData.error || "Failed to fetch wishlist");
        }
        const data = await res.json();
        setWishlist(data);
      } catch (err) {
        setError((err as Error).message); 
      } finally {
        setLoading(false);
      }
    }
  
    if (wishlistId) {
      fetchWishlist();
    }
  }, [wishlistId]);
  

  // Refresh the wishlist data
  const refreshWishlist = async () => {
    try {
      const res = await fetch(`/api/public-wishlists/${wishlistId}`);
      if (!res.ok) throw new Error("Failed to refresh wishlist");
      const data = await res.json();
      setWishlist(data);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      wishlist?.theme || "default"
    );
  }, [wishlist?.theme]);
  

  // Function to fetch reservation user info for a given wish ID using your API
  async function fetchReservationUser(wishId: string) {
    try {
      const res = await fetch(`/api/reservations/${wishId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch reservation user");
      }
      const user = await res.json();
      return user;
    } catch (error) {
      console.error("Error fetching reservation user:", error);
      return null;
    }
  }

  // Loop through wishlist.reservations and fetch the reserved user for each wish
  useEffect(() => {
    const fetchAllReservationUsers = async () => {
      if (!wishlist?.reservations) return;
  
      const promises = wishlist.reservations.map(async (res) => {
        const user = await fetchReservationUser(res.wish_id);
        return user ? { [res.wish_id]: user.name || user.email } : null;
      });
  
      const results = await Promise.all(promises);
      const merged = results.reduce((acc, item) => (item ? { ...acc, ...item } : acc), {});
      setReservationUsers(merged);
    };
  
    fetchAllReservationUsers();
  }, [wishlist]);
  

  // Handle reservation for a wish
  const handleReserve = async (wishId: string) => {
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wishlistId, wishId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reserve wish");
      }
      
      toast.success("Gift reserved!");
      if (wishlist) {
        setWishlist({
          ...wishlist,
          reservations: [
            ...(wishlist.reservations || []),
            {
              wishlist_id: wishlist._id,
              wish_id: wishId,
              user_id: session?.user?.email,
              reserved_at: new Date().toISOString(),
            },
          ],
        });
      }
      // After reserving, refresh the wishlist to update reservation users
      refreshWishlist();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };
  const handleCancelReservation = async (wishId: string) => {
    const res = await fetch(`/api/reservations/${wishId}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json();
      toast.error(body.error || "Failed to cancel");
      return;
    }
    toast.success("Reservation cancelled");
    setWishlist((w) => ({
      ...w,
      reservations: w.reservations?.filter((r) => r.wish_id !== wishId),
    }));
  };
  // Update a wish after editing
  const handleWishUpdated = (
    updatedWish: Wish,
    event?: React.MouseEvent<HTMLButtonElement>
  ) => {
    (event?.currentTarget as HTMLButtonElement)?.blur(); 
  
    if (updatedWish.deleted) {
      setWishlist((prev) => ({
        ...prev!,
        wishes: prev!.wishes.filter((w) => w._id !== updatedWish._id),
      }));
    } else if (wishlist) {
      setWishlist({
        ...wishlist,
        wishes: wishlist.wishes.map((wish) =>
          wish._id === updatedWish._id ? updatedWish : wish
        ),
      });
    }
  
    setIsEditWishModalOpen(false);
    setSelectedWish(null);
  };
  
  if (!wishlistId)
    return <p className="text-center text-lg text-error">Missing ID</p>;

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center">
      <span className="loading loading-spinner loading-xl"></span>
    </div>
    
    );

  if (error) return <p className="text-center text-lg text-error">{error}</p>;

  // Determine if the current session user is the owner of the wishlist
  const isOwner = session?.user?.email === wishlist?.user_id?.email;

  return (
    <main className="min-h-screen max-w-xl mx-auto space-y-6 p-4 pb-24 relative">
      {/* Navbar */}
      <WishlistHeader
  isOwner={isOwner}
  session={session}
  onEditWishlist={() => setIsWishlistModalOpen(true)}
  onAddWish={() => setIsAddModalOpen(true)}
  userMenu={<UserMenu />}
/>


      {/* Wishlist Owner Info */}
      {wishlist && (
        <section className="text-center">
          <h1 className="text-6xl font-bold mt-2">{wishlist.title}</h1>
          {isOwner ? null : (
            <div className="mt-4 text-left flex items-center justify-start space-x-2">
              {wishlist.user_id.image ? (
                <img
                  src={wishlist.user_id.image}
                  alt={wishlist.user_id.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-sm">{wishlist.user_id.name.charAt(0)}</span>
                </div>
              )}
              <div className="text-xs">
                <p className="font-semibold">{wishlist.user_id.name}</p>
                <p className="font-light">{wishlist.user_id.email}</p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* List of Wishes */}
      <ul className="space-y-4">
        {wishlist?.wishes.slice(0, visibleCount).map((wish) => {
          const reservationForWish = wishlist?.reservations?.find(
            (r) => r.wish_id.toString() === wish._id.toString()
          );
          const isReserved = Boolean(reservationForWish);
          const isMine = reservationForWish?.user_id === session?.user?.id;
         
          return (
            <li
            
            key={wish._id}
            className={clsx(
              "rounded-xl p-4 bg-base-100 shadow-md space-y-2 transition-all",
              isMine ? "border-2 border-primary" : "border"
            )}
          
           >
              <h3 className="text-lg font-semibold">{wish.name}</h3>
              {wish.description && <p>{wish.description}</p>}
              {wish.image_url && (
                <img
                  src={wish.image_url}
                  alt={wish.name}
                  className="w-full h-auto rounded"
                />
              )}
              {wish.product_url && (
                <a
                  href={wish.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  View product ↗
                </a>
              )}
              {wish.price && <p>💰 €{wish.price}</p>}
              <p className="text-sm text-gray-500">
                Added: {new Date(wish.added_at).toLocaleDateString()}
              </p>
              {isReserved ? (
  session ? (
    isOwner ? (
      <p className="text-success font-semibold">Reserved</p>
    ) : isMine ? (
      <div className="mt-2">
    <button
      onClick={() => handleCancelReservation(wish._id)}
      className="btn btn-sm btn-error normal-case"
    >
      Cancel reservation
    </button>
  </div>
    ) : (
      <p className="text-success font-semibold">
        Reserved by {" "}
        <button
          className="underline underline-offset-2 hover:text-info transition"
          onClick={(e) => {
            const reservation = wishlist?.reservations?.find(
              (r) => r.wish_id === wish._id
            );
            if (reservation?.user_id) handleShowUserInfo(reservation.user_id, e);
          }}
        >
          {reservationUsers[wish._id] || (
            <span className="loading loading-spinner loading-xs" />
          )}
        </button>
      </p>
    )
  ) : (
    <div className="flex items-start text-success font-semibold gap-1">
      Reserved by 
      <div
        className="tooltip h-4 w-4 text-gray-400 hover:text-info transition"
        data-tip="Log in to see who reserved"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
          />
        </svg>
      </div>
    </div>
  )
) : isOwner ? (
  <p className="text-gray-500">Not reserved</p>
) : (
  <button
    className="btn btn-sm btn-primary"
    onClick={() => handleReserve(wish._id)}
  >
    Reserve this gift
  </button>
)}


              {isOwner && (
                <button
                  className="btn btn-sm btn-primary mt-2"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    setSelectedWish(wish);
                    setIsEditWishModalOpen(true);
                  }}
                >
                  Edit Wish
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {/* Show More button */}
      <ShowMoreButton
        currentCount={visibleCount}
        total={wishlist?.wishes.length || 0}
        onShowMore={() => setVisibleCount(visibleCount + 5)}
      />

      {/* Edit Wishlist Modal for owner */}
      {isOwner && wishlist && (
        <EditWishlistModal
          wishlistId={wishlist._id}
          initialTitle={wishlist.title}
          initialTheme={wishlist.theme || "default"}
          initialVisibility={wishlist.visibility || "private"}
          isOpen={isWishlistModalOpen}
          setIsOpen={setIsWishlistModalOpen}
          onUpdate={(updated) => {
            refreshWishlist();
            setIsWishlistModalOpen(false);
          }}
        />
      )}

      <AddWishModal
        wishlistId={wishlistId}
        isOpen={isAddModalOpen}
        setIsOpen={setIsAddModalOpen}
        onWishAdded={() => {
          refreshWishlist();
        }}
      />
      {isOwner && selectedWish && isEditWishModalOpen && (
        <EditWishModal
          wishlistId={wishlist!._id}
          wish={selectedWish}
          isOpen={isEditWishModalOpen}
          setIsOpen={setIsEditWishModalOpen}
          onWishUpdated={handleWishUpdated}
        />
      )}
      {selectedUser && (
  <UserProfileModal
    isOpen={isUserModalOpen}
    onClose={() => setIsUserModalOpen(false)}
    user={selectedUser}
  />
)}

    </main>
  );
}

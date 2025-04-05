"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { useSession, signIn, signOut } from "next-auth/react";
import EditWishlistModal from "@/components/wishlist/EditWishlistModal";
import EditWishModal from "@/components/wishlist/EditWishModal";
import AddWishModal from "@/components/wishlist/AddWishModal";
import { Settings, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import config from "@/config";
import logo from "@/app/icon.png";
import ShowMoreButton from "@/components/wishlist/ShowMoreButton";
import UserProfileModal from "@/components/user/UserProfileModal";
import WishlistHeader from "@/components/wishlist/WishListHeader";

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

export default function WishlistPage() {
  const params = useParams();
  const wishlistId = params?.id as string;
  const { data: session } = useSession();
  const [wishlist, setWishlist] = useState<WishlistData | null>(null);
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


const handleShowUserInfo = async (userId: string) => {
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

  // Update the global theme on <html> based on wishlist.theme
  useEffect(() => {
    if (wishlist?.theme) {
      document.documentElement.setAttribute("data-theme", wishlist.theme);
    } else {
      document.documentElement.setAttribute("data-theme", "default");
    }
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
    async function fetchAllReservationUsers() {
      if (wishlist && wishlist.reservations) {
        const newReservationUsers: Record<string, string> = {};
        for (const res of wishlist.reservations) {
          const user = await fetchReservationUser(res.wish_id);
          if (user) {
            newReservationUsers[res.wish_id] = user.name || user.email;
          }
        }
        setReservationUsers(newReservationUsers);
      }
    }
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
        const msg = await res.text();
        throw new Error(msg || "Failed to reserve wish");
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
              user_id: session?.user?.email || "unknown",
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

  // Update a wish after editing
  const handleWishUpdated = (updatedWish: Wish) => {
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
      <p className="text-center text-lg">
        <span className="loading loading-spinner loading-xl"></span>
      </p>
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
  onShowUserProfile={() => handleShowUserInfo(session.user.id)}
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
          return (
            <li
              key={wish._id}
              className="border rounded-xl p-4 bg-base-100 shadow-md space-y-2"
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
                isOwner ? (
                  <p className="text-success font-semibold">Reserved</p>
                ) : (
                  <p className="text-success font-semibold">
                  Reserved by{" "}
                  <button
                    className="underline underline-offset-2 hover:text-primary"
                    onClick={() => {
                      const reservation = wishlist?.reservations?.find(
                        (r) => r.wish_id.toString() === wish._id.toString()
                      );
                      if (reservation?.user_id) {
                        handleShowUserInfo(reservation.user_id);
                      }
                    }}
                  >
                    {reservationUsers[wish._id] || "someone"}
                  </button>
                </p>
                
                
                
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
                  onClick={() => {
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
      {isOwner && selectedWish && (
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

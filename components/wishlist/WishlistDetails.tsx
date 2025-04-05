import { useState } from "react";
import WishList from "@/components/wishlist/Wishlist";

interface Wishlist {
  _id: string;
  title: string;
  theme: string;
  visibility: string;
  created_at: string;
}

export default function WishlistDetails({ wishlistId, wishlist }: { wishlistId: string; wishlist?: Wishlist }) {
  const [editing, setEditing] = useState(false);

  if (!wishlist) {
    return <p className="text-center text-lg text-error">Error: Wishlist data is missing</p>;
  }

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-xl mx-auto space-y-8">
        {/* Wishlist Details Card */}
          <h1 className="text-3xl font-extrabold mb-4">{wishlist.title}</h1>

          <div className="space-y-2 text-gray-700">
            <p><strong>Theme:</strong> {wishlist.theme}</p>
            <p><strong>Visibility:</strong> {wishlist.visibility}</p>
            <p className="text-xs text-gray-500"><strong>Created:</strong> {new Date(wishlist.created_at).toLocaleDateString()}</p>
          </div>


        {/* Wish List Component */}
        <WishList wishlistId={wishlistId} />
      </section>
    </main>
  );
}


import Client from "./Client";
import connectMongo from "@/libs/mongoose";
import Wishlist from "@/models/Wishlist";

export const dynamic = "force-dynamic";


export default async function WishlistPage({ params }: { params: { id: string } }) {
  await connectMongo();
  const wishlist = await Wishlist.findById(params.id).lean();

  if (!wishlist) {
    return <div className="text-center mt-20 text-lg text-error">Wishlist not found</div>;
  }

  return <Client serverWishlist={JSON.parse(JSON.stringify(wishlist))} />;
}

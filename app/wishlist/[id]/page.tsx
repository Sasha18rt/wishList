
import Client from "./Client";
import connectMongo from "@/libs/mongoose";
import Wishlist from "@/models/Wishlist";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
    await connectMongo();
    interface WishlistLean {
        title: string;
      }
      
      const wishlist = await Wishlist.findById(params.id).lean<WishlistLean>();
      const title = wishlist?.title || "Wishlist on Wishlify";
      
  
    return {
      title,
      description: "A wishlist created with ❤️ on Wishlify",
      openGraph: {
        title,
        description: "Check out this wishlist on Wishlify",
        url: `https://wishlify.me/wishlist/${params.id}`,
        images: [
          {
            url: `https://wishlify.me/api/og/wishlist/${params.id}`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: "Check out this wishlist on Wishlify",
        images: [`https://wishlify.me/api/og/wishlist/${params.id}`],
      },
    };
  }
  

export default async function WishlistPage({ params }: { params: { id: string } }) {
  await connectMongo();
  const wishlist = await Wishlist.findById(params.id).lean();

  if (!wishlist) {
    return <div className="text-center mt-20 text-lg text-error">Wishlist not found</div>;
  }

  return <Client serverWishlist={JSON.parse(JSON.stringify(wishlist))} />;
}

import Client from "./Client";
import connectMongo from "@/libs/mongoose";
import Wishlist from "@/models/Wishlist";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  await connectMongo();

  const wishlist = await Wishlist.findById(params.id)
    .select("title")
    .lean<{ title?: string }>();

  const title = wishlist?.title || "Wishlist on Wishlify";
  const description = "Wishlist created on Wishlify";
  const url = `https://wishlify.me/wishlist/${params.id}`;
  const ogImage = `https://wishlify.me/api/og/wishlist/${params.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function WishlistPage({ params }: { params: { id: string } }) {
  await connectMongo();

  const wishlist = await Wishlist.findById(params.id).lean();

  if (!wishlist) {
    return (
      <div className="text-center mt-20 text-lg text-error">
        Wishlist not found
      </div>
    );
  }

  return <Client serverWishlist={JSON.parse(JSON.stringify(wishlist))} />;
}
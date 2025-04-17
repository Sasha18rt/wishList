import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: "Wishlist on Wishlify",
    openGraph: {
      title: "Wishlist on Wishlify",
      images: [`https://wishlify.me/api/og/wishlist/${params.id}`],
    },
  };
}
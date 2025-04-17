import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Wishlist from "@/models/Wishlist";

export async function GET() {
  try {
    await connectMongo();

    // Fetch all public wishlists
    const publicWishlists = await Wishlist.find({ visibility: "public" });

    // Flatten all wishes from all wishlists
    const allWishes = publicWishlists.flatMap((wishlist) => wishlist.wishes);

    // Group by product_url OR image_url OR name as fallback
    const grouped: Record<string, { count: number; wish: any }> = {};

    for (const wish of allWishes) {
      const key = wish.product_url || wish.image_url || wish.name;

      if (grouped[key]) {
        grouped[key].count++;
      } else {
        grouped[key] = { count: 1, wish };
      }
    }

    // Convert to array, sort by count descending, and return only one wish per group
    const uniqueWishes = Object.values(grouped)
      .sort((a, b) => b.count - a.count)
      .map((entry) => entry.wish);

    return NextResponse.json(uniqueWishes, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error fetching public wishes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Wishlist from "@/models/Wishlist";

export async function GET() {
  try {
    await connectMongo();
    const publicWishlists = await Wishlist.find({ visibility: "public" });
    const allWishes = publicWishlists.reduce((acc, wishlist) => {
      return acc.concat(wishlist.wishes);
    }, []);
    return NextResponse.json(allWishes, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching public wishes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

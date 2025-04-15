import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Wishlist from "@/models/Wishlist";

export async function GET() {
  try {
    // Connect to the MongoDB database
    await connectMongo();

    // Find all wishlists where visibility is "public" and populate the user info
    const wishlists = await Wishlist.find({ visibility: "public" })
      .populate("user_id", "name email nickname image");

    // Return the wishlists as JSON
    return NextResponse.json(wishlists, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching public wishlists:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

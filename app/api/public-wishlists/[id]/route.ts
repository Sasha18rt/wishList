import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import Wishlist from "@/models/Wishlist";
import Reservation from "@/models/Reservations";
import mongoose from "mongoose";
 User;

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await connectMongo();

    const wishlist = await Wishlist.findById(id).populate(
      "user_id",
      "name email nickname image"
    );

    if (!wishlist) {
      return new Response(JSON.stringify({ error: "Wishlist not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (wishlist.visibility !== "public") {
      return new Response(JSON.stringify({ error: "Wishlist is not public" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const reservations = await Reservation.find({ wishlist_id: id });

    const wishlistObj = wishlist.toObject();
    wishlistObj.reservations = reservations;

    return new Response(JSON.stringify(wishlistObj), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching public wishlist:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

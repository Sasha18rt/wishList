import { ReactNode } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Wishlist from "@/models/Wishlist";
import Reservation from "@/models/Reservations";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    // підключаємося до БД
    await connectMongo();

    // отримуємо сесію (якщо є)
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    // знаходимо Wishlist і відразу підтягуємо дані власника
    const wishlist = await Wishlist.findById(id).populate(
      "user_id",
      "name email nickname image"
    );

    if (!wishlist) {
      return new Response(
        JSON.stringify({ error: "Wishlist not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // визначаємо, чи це власник
    const ownerId = wishlist.user_id?._id?.toString();
    const isOwner = ownerId && currentUserId === ownerId;

    // якщо не публічний і не власник — 403
    if (wishlist.visibility !== "public" && !isOwner) {
      return new Response(
        JSON.stringify({ error: "Wishlist is not public" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // далі — підтягуємо резервації і повертаємо результат
    const reservations = await Reservation.find({ wishlist_id: id });
    const wishlistObj = wishlist.toObject();
    wishlistObj.reservations = reservations;

    return new Response(JSON.stringify(wishlistObj), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

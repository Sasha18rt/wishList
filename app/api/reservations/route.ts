import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Reservation from "@/models/Reservations";

export async function POST(req: Request) {
  try {
    const { wishlistId, wishId } = await req.json();

    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(
        JSON.stringify({ error: "You need to be logged in to reserve the gift" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if the wish is already reserved
    const existing = await Reservation.findOne({ wishlist_id: wishlistId, wish_id: wishId });
    if (existing) {
      return new Response(
        JSON.stringify({ error: "Already reserved" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create the new reservation
    const newReservation = await Reservation.create({
      wishlist_id: wishlistId,
      wish_id: wishId,
      user_email: session.user.email,
      user_id: session.user.id,
      reservedBy: session.user.email,
    });

    

    // Return the created reservation with a success message
    return new Response(
      JSON.stringify({ message: "Reserved", reservation: newReservation }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in reservation:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

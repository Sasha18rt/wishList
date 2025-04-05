
import connectMongo from "@/libs/mongoose";
import Reservation from "@/models/Reservations";
import User from "@/models/User";



export async function GET(
    req: Request,
    { params }: { params: { id: string } }
  ) {
    try{
        await connectMongo();

        const reservation = await Reservation.findOne({ wish_id: params.id });
    if (!reservation) {
      return new Response(
        JSON.stringify({ error: "Reservation not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const user = await User.findById(reservation.user_id);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(user), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
        console.error("Error fetching user from reservation:", error);
        return new Response(
          JSON.stringify({ error: "Internal server error" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }}
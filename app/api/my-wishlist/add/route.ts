import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Wishlist from "@/models/Wishlist";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectMongo();

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { wishlistId, giftId } = await req.json();

    if (!wishlistId || !giftId) {
      return new Response(JSON.stringify({ error: "Missing wishlistId or giftId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const wishlist = await Wishlist.findOne({ _id: wishlistId, user_id: user._id });

    if (!wishlist) {
      return new Response(JSON.stringify({ error: "Wishlist not found or not yours" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Prevent duplicates
    if (wishlist.items?.includes(giftId)) {
      return new Response(JSON.stringify({ message: "Gift already added" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Push giftId into items array
    wishlist.items = [...(wishlist.items || []), giftId];
    await wishlist.save();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error adding gift:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

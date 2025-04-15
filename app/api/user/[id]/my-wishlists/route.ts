import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Wishlist from "@/models/Wishlist";
import User from "@/models/User";

/**
 * @desc Get all wishlists for a specific user
 * @route GET /api/user/:id/my-wishlists
 * @access Private (Authenticated Users)
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    if (!user || user._id.toString() !== params.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const wishlists = await Wishlist.find({ user_id: user._id }).select("_id title visibility");

    return new Response(JSON.stringify(wishlists), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching user wishlists:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

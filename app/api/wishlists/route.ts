import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Wishlist from "@/models/Wishlist";
import User from "@/models/User";

/**
 * @desc Create a new wishlist
 * @route POST /api/wishlists
 * @access Private (Authenticated Users)
 */
export async function POST(req: Request) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401, headers: { "Content-Type": "application/json" } 
      });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { 
        status: 404, headers: { "Content-Type": "application/json" } 
      });
    }

    const body = await req.json();
    const { title, theme, visibility } = body;

    if (!title) {
      return new Response(JSON.stringify({ error: "Title is required" }), { 
        status: 400, headers: { "Content-Type": "application/json" } 
      });
    }
    if (title.length > 10) {
      return new Response(JSON.stringify({ error: "Title is too long. Maximum length is 10 characters." }), { 
        status: 400, headers: { "Content-Type": "application/json" } 
      });
    }
    // Check if the wishlist with the same title already exists for the user
    const existingWishlist = await Wishlist.findOne({ user_id: user._id, title });

    if (existingWishlist) {
      return new Response(JSON.stringify({ error: "This wishlist name is already taken. Try another name." }), { 
        status: 409, headers: { "Content-Type": "application/json" } 
      });
    }

    // Create a new wishlist
    const newWishlist = await Wishlist.create({
      user_id: user._id,
      title,
      theme: theme || "default",
      visibility: visibility || "private",
    });

    return new Response(JSON.stringify(newWishlist), { 
      status: 201, headers: { "Content-Type": "application/json" } 
    });

  } catch (error) {
    console.error("Error creating wishlist:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { 
      status: 500, headers: { "Content-Type": "application/json" } 
    });
  }
}

/**
 * @desc Get all wishlists for the authenticated user
 * @route GET /api/wishlists
 * @access Private (Authenticated Users)
 */
export async function GET(req: Request) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401, headers: { "Content-Type": "application/json" } 
      });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { 
        status: 404, headers: { "Content-Type": "application/json" } 
      });
    }

    const wishlists = await Wishlist.find({ user_id: user._id }).sort({ created_at: -1 });

    return new Response(JSON.stringify(wishlists), { 
      status: 200, headers: { "Content-Type": "application/json" } 
    });

  } catch (error) {
    console.error("Error fetching wishlists:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { 
      status: 500, headers: { "Content-Type": "application/json" } 
    });
  }
}

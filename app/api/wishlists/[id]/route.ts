import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Wishlist from "@/models/Wishlist";
import User from "@/models/User";
import Reservations from "@/models/Reservations";
import { wishListSchema } from "@/app/validation/schemas";

/**
 * @desc Get a specific wishlist by ID
 * @route GET /api/wishlists/:id
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
        headers: { "Content-Type": "application/json" } 
      });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { 
        status: 404, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    const wishlist = await Wishlist.findOne({ _id: params.id, user_id: user._id });
    if (!wishlist) {
      return new Response(JSON.stringify({ error: "Wishlist not found" }), { 
        status: 404, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    // Query reservations from the Reservation collection for this wishlist
    const reservations = await Reservations.find({ wishlist_id: params.id });

    // Convert wishlist to a plain object and attach the reservations array
    const wishlistData = wishlist.toObject();
    wishlistData.reservations = reservations;

    return new Response(JSON.stringify(wishlistData), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
}

/**
 * @desc Update a specific wishlist by ID
 * @route PUT /api/wishlists/:id
 * @access Private (Authenticated Users)
 */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    
    const body = await req.json();
    const { title, theme, visibility } = body;

    const parseResult = wishListSchema.safeParse(body);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({ error: parseResult.error.errors[0].message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const updatedWishlist = await Wishlist.findOneAndUpdate(
      { _id: params.id, user_id: user._id },
      { title, theme, visibility },
      { new: true }
    );

    if (!updatedWishlist) {
      return new Response(JSON.stringify({ error: "Wishlist not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(updatedWishlist), { status: 200 });

  } catch (error) {
    console.error("Error updating wishlist:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

/**
 * @desc Delete a specific wishlist by ID
 * @route DELETE /api/wishlists/:id
 * @access Private (Authenticated Users)
 */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const deletedWishlist = await Wishlist.findOneAndDelete({ _id: params.id, user_id: user._id });

    if (!deletedWishlist) {
      return new Response(JSON.stringify({ error: "Wishlist not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Wishlist deleted successfully" }), { status: 200 });

  } catch (error) {
    console.error("Error deleting wishlist:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

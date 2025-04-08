import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Wishlist from "@/models/Wishlist";
import User from "@/models/User";
import { wishSchema } from "@/app/validation/schemas";

/**
 * @desc Update a specific wish inside a wishlist
 * @route PUT /api/wishlists/:id/wishes/:wishId
 * @access Private (Authenticated Users)
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string; wishId: string } }
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
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const wishlist = await Wishlist.findOne({
      _id: params.id,
      user_id: user._id,
    });
    if (!wishlist) {
      return new Response(JSON.stringify({ error: "Wishlist not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const wishIndex = wishlist.wishes.findIndex(
      (wish: any) => wish._id.toString() === params.wishId
    );
    if (wishIndex === -1) {
      return new Response(JSON.stringify({ error: "Wish not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await req.json();

    const result = wishSchema.safeParse(data);
    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error.errors[0].message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const validatedData = result.data;

    const wish = wishlist.wishes[wishIndex];
    if (validatedData.name !== undefined) wish.name = validatedData.name;
    if (validatedData.description !== undefined) wish.description = validatedData.description;
    if (validatedData.image_url !== undefined) wish.image_url = validatedData.image_url;
    if (validatedData.product_url !== undefined) wish.product_url = validatedData.product_url;
    if (validatedData.price !== undefined) wish.price = validatedData.price;

    await wishlist.save();

    return new Response(JSON.stringify(wish.toObject()), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating wish:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


/**
 * @desc Delete a specific wish from a wishlist
 * @route DELETE /api/wishlists/:id/wishes/:wishId
 * @access Private (Authenticated Users)
 */
export async function DELETE(
    req: Request,
    { params }: { params: { id: string; wishId: string } }
  ) {
    try {
      await connectMongo();
      const session = await getServerSession(authOptions);
      if (!session)
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  
      const user = await User.findOne({ email: session.user.email });
      if (!user)
        return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  
      const wishlist = await Wishlist.findOne({ _id: params.id, user_id: user._id });
      if (!wishlist)
        return new Response(JSON.stringify({ error: "Wishlist not found" }), { status: 404 });
  
      const originalLength = wishlist.wishes.length;
      wishlist.wishes = wishlist.wishes.filter(
        (wish: any) => wish._id.toString() !== params.wishId
      );
  
      if (wishlist.wishes.length === originalLength) {
        return new Response(JSON.stringify({ error: "Wish not found" }), { status: 404 });
      }
  
      await wishlist.save();
  
      return new Response(JSON.stringify({ message: "Wish deleted successfully" }), { status: 200 });
    } catch (error) {
      console.error("Error deleting wish:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
  }
  

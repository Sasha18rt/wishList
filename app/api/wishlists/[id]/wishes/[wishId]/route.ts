import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Wishlist from "@/models/Wishlist";
import User from "@/models/User";

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
      if (!session)
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  
      const user = await User.findOne({ email: session.user.email });
      if (!user)
        return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  
      const wishlist = await Wishlist.findOne({ _id: params.id, user_id: user._id });
      if (!wishlist)
        return new Response(JSON.stringify({ error: "Wishlist not found" }), { status: 404 });
  
      const wishIndex = wishlist.wishes.findIndex(
        (wish: any) => wish._id.toString() === params.wishId
      );
      if (wishIndex === -1)
        return new Response(JSON.stringify({ error: "Wish not found" }), { status: 404 });
  
      const data = await req.json();
      const wish = wishlist.wishes[wishIndex];
  
      if (data.name !== undefined) wish.name = data.name;
      if (data.description !== undefined) wish.description = data.description;
      if (data.image_url !== undefined) wish.image_url = data.image_url;
      if (data.product_url !== undefined) wish.product_url = data.product_url;
      if (data.price !== undefined) wish.price = data.price?.toString();
  
      await wishlist.save();
  
      const updatedWish = wish.toObject();
  
      return new Response(JSON.stringify(updatedWish), { status: 200 });
    } catch (error) {
      console.error("Error updating wish:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
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
  

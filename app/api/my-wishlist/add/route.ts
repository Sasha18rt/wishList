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

    const body = await req.json();
    const { wishlistId, gift } = body;

    if (!wishlistId || !gift || typeof gift !== "object") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid wishlistId or gift" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const wishlist = await Wishlist.findOne({
      _id: wishlistId,
      user_id: user._id,
    });

    if (!wishlist) {
      return new Response(
        JSON.stringify({ error: "Wishlist not found or not yours" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const duplicate = gift.product_url
    ? wishlist.wishes.some(
        (w: any) =>
          w.product_url === gift.product_url ||
          (gift.image_url && w.image_url === gift.image_url)
      )
    : gift.image_url
    ? wishlist.wishes.some((w: any) => w.image_url === gift.image_url)
    : false;
  
  

    if (duplicate) {
      return new Response(
        JSON.stringify({ message: "Gift already exists in wishlist" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build gift object to push
    const newGift = {
      name: gift.name,
      description: gift.description || "",
      image_url: gift.image_url || null,
      image_public_id: gift.image_public_id || null,
      product_url: gift.product_url,
      price: gift.price === "" ? null : gift.price,
      added_at: new Date(),
    };

    wishlist.wishes.push(newGift);
    await wishlist.save();

    return new Response(JSON.stringify(newGift), {
      status: 201,
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

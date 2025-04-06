import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Wishlist from "@/models/Wishlist";
import User from "@/models/User";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!params.id) {
    return new Response(JSON.stringify({ error: "Missing wishlist I3D" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

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

    const formattedWishes = wishlist.wishes.map((wish: any) => {
      const plainWish = wish.toObject();
      return {
        ...plainWish,
        price: plainWish.price?.toString() ?? "", 
      };
    });

    return new Response(JSON.stringify(formattedWishes), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching wishes:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * @desc Add a new wish to a wishlist
 * @route POST /api/wishlists/:id/wishes
 * @access Private
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });

    const user = await User.findOne({ email: session.user.email });
    if (!user)
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });

    const wishlist = await Wishlist.findOne({
      _id: params.id,
      user_id: user._id,
    });
    if (!wishlist)
      return new Response(JSON.stringify({ error: "Wishlist not found" }), {
        status: 404,
      });

    const { name, description, image_url, product_url, price } = await req.json();
    const normalizedPrice = price === "" ? null : price;
    if (!name || name.trim() === "") {
      return new Response(JSON.stringify({ error: "Name is required" }), {
        status: 400,
      });
    }

    const newWish = {
      name,
      description,
      image_url,
      product_url,
      price: normalizedPrice,
      added_at: new Date(),
    };

    if (name.length > 20 ){
      return new Response(JSON.stringify({ error: "Title is too long. Maximum length is 20 characters." }), { status: 400 });
    }
    if (description.length > 200 ){
      return new Response(JSON.stringify({ error: "Description is too long. Maximum length is 200 characters." }), { status: 400 });
    }


    wishlist.wishes.push(newWish);
    await wishlist.save();

    return new Response(JSON.stringify(newWish), { status: 201 });
  } catch (error) {
    console.error("Error creating wish:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}

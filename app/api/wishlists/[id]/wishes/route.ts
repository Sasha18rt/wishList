import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Wishlist from "@/models/Wishlist";
import User from "@/models/User";
import { wishListSchema, wishSchema } from "@/app/validation/schemas";

export async function GET(
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

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();

    const session = await getServerSession(authOptions);
    if (!session)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const user = await User.findOne({ email: session.user.email });
    if (!user)
      return Response.json({ error: "User not found" }, { status: 404 });

    const wishlist = await Wishlist.findOne({
      _id: params.id,
      user_id: user._id,
    });
    if (!wishlist)
      return Response.json({ error: "Wishlist not found" }, { status: 404 });

    const data = await req.json();

    const parsed = wishSchema.safeParse(data);

    const {
      name,
      description,
      image_url,
      image_public_id,
      product_url,
      price,
    } = parsed.data;

    const newWish = {
      name,
      description,
      image_url: image_url || null,
      image_public_id: image_public_id || null,
      product_url,
      price: price === "" ? null : price,
      added_at: new Date(),
    };


    wishlist.wishes.push(newWish);
    await wishlist.save();

    return Response.json(newWish, { status: 201 });
  } catch (error) {
    console.error("Error creating wish:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

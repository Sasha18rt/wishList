import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import Wishlist from "@/models/Wishlist";
import Reservation from "@/models/Reservations";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: "Invalid wishlist id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await connectMongo();

    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id ?? null;

    const wishlist = await Wishlist.findById(id)
      .populate({
        path: "user_id",
        model: User,
        select: "name email nickname image",
      })
      .lean() as any;

    if (!wishlist) {
      return new Response(JSON.stringify({ error: "Wishlist not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const ownerId =
      typeof wishlist.user_id === "object" && wishlist.user_id?._id
        ? String(wishlist.user_id._id)
        : null;

    const isOwner = !!ownerId && currentUserId === ownerId;

    if (wishlist.visibility !== "public" && !isOwner) {
      return new Response(JSON.stringify({ error: "Wishlist is not public" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (session?.user?.email && !isOwner) {
      await User.updateOne(
        { email: session.user.email },
        { $pull: { recentlyViewed: { wishlistId: wishlist._id } } }
      );

      await User.updateOne(
        { email: session.user.email },
        {
          $push: {
            recentlyViewed: {
              $each: [{ wishlistId: wishlist._id, viewedAt: new Date() }],
              $position: 0,
              $slice: 10,
            },
          },
        }
      );
    }

    const reservations = await Reservation.find({
      wishlist_id: wishlist._id,
    }).lean();

    const normalizedWishes = Array.isArray(wishlist.wishes)
      ? wishlist.wishes.map((w: any) => {
          let priceStr = w?.price != null ? String(w.price) : "";
          let currency: string | null = w?.currency ?? null;

          if (!currency && typeof w?.price === "string") {
            const m = w.price.match(
              /^\s*([0-9]+(?:[.,][0-9]+)?)\s+([A-Z]{3})\s*$/
            );

            if (m) {
              priceStr = m[1].replace(",", ".");
              currency = m[2];
            }
          }

          return {
            ...w,
            description: w?.description ?? "",
            image_url: w?.image_url ?? null,
            image_public_id: w?.image_public_id ?? null,
            product_url: w?.product_url ?? "",
            price: priceStr,
            currency: currency ?? null,
          };
        })
      : [];

    const wishlistObj = {
      ...wishlist,
      description: wishlist.description ?? "",
      wishes: normalizedWishes,
      reservations,
    };

    return new Response(JSON.stringify(wishlistObj), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
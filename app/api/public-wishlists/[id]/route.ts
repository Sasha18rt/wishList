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
    await connectMongo();

    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    // 1) Отримуємо вішлист + власника
    const wishlist = await Wishlist.findById(id).populate({
      path: "user_id",
      model: User,
      select: "name email nickname image",
    });

    if (!wishlist) {
      return new Response(JSON.stringify({ error: "Wishlist not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const ownerId = wishlist.user_id?._id?.toString();
    const isOwner = ownerId && currentUserId === ownerId;

    // 2) Якщо приватний — доступ лише власнику
    if (wishlist.visibility !== "public" && !isOwner) {
      return new Response(JSON.stringify({ error: "Wishlist is not public" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3) Зберігаємо "нещодавно переглянуті" для не-власника
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

    // 4) Резервації цього вішлисту
    const reservations = await Reservation.find({ wishlist_id: id });

    // 5) Формуємо відповідь + НОРМАЛІЗАЦІЯ wishes
    const wishlistObj: any = wishlist.toObject();

    if (Array.isArray(wishlistObj.wishes)) {
      wishlistObj.wishes = wishlistObj.wishes.map((w: any) => {
        // базові значення
        let priceStr = w?.price != null ? String(w.price) : "";
        let currency: string | null = w?.currency ?? null;

        // legacy: якщо в price лежить "199.99 USD" і currency ще не задано
        if (!currency && typeof w?.price === "string") {
          const m = w.price.match(
            /^\s*([0-9]+(?:[.,][0-9]+)?)\s+([A-Z]{3})\s*$/
          );
          if (m) {
            priceStr = m[1].replace(",", "."); // нормалізуємо крапку
            currency = m[2];
          }
        }

        return {
          ...w,
          price: priceStr,           // завжди РЯДОК ("" якщо відсутня)
          currency: currency ?? null // код або null
        };
      });
    }

    wishlistObj.reservations = reservations;

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

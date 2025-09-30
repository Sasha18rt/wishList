import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Reservation from "@/models/Reservations";
import Wishlist from "@/models/Wishlist";
import User from "@/models/User";
import { Types } from "mongoose";

// GET /api/reservations — для дешборду
export async function GET(_req: NextRequest) {
  try {
    await connectMongo();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // поточний юзер
     const user = (await User.findOne({ email: session.user.email })
    .select("_id")
    .lean()) as { _id: Types.ObjectId } | null;

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
    // усі резервації цього юзера
    const reservations = await Reservation.find({
      $or: [
        { user_id: user._id },
        { user_email: session.user.email },
      ],
    }).lean();

    if (reservations.length === 0) {
      return NextResponse.json([]);
    }

    // унікальні id
    const wishlistIds = Array.from(new Set(reservations.map(r => r.wishlist_id?.toString())));
    const wishIds = Array.from(new Set(reservations.map(r => r.wish_id?.toString())));

    // тягнемо вішлисти з вкладеними wishes
    const wishlists = await Wishlist.find({ _id: { $in: wishlistIds } })
      .select("_id title wishes._id wishes.name wishes.image_url")
      .lean();

    // мапи
    const wlMap = new Map<string, string>();
    const wishMap = new Map<string, { title: string; wishlistId: string; image?: string | null }>();

   for (const wl of wishlists) {
  wlMap.set(wl._id.toString(), wl.title);

  for (const w of (wl.wishes ?? []) as { _id: any; name: string; image_url?: string }[]) {
    wishMap.set(w._id.toString(), {
      title: w.name,
      wishlistId: wl._id.toString(),
      image: w.image_url ?? null, // 👈 гарантовано string | null
    });
  }
}
    // формуємо payload
    const payload = reservations.map(r => {
      const wishlistId = r.wishlist_id?.toString();
      const wishId = r.wish_id?.toString();
      const wishMeta = wishId ? wishMap.get(wishId) : undefined;

      return {
        id: r._id.toString(),
        wishlistId,
        wishlistTitle: wishlistId ? wlMap.get(wishlistId) : undefined,
        wishId,
         wishImage: wishMeta?.image,
        wishTitle: wishMeta?.title,
        reservedAt: r.reserved_at ?? r.createdAt ?? new Date(),
      };
    });

    return NextResponse.json(payload);
  } catch (e) {
    console.error("GET /api/reservations error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { wishlistId, wishId } = await req.json();

    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(
        JSON.stringify({ error: "You need to be logged in to reserve the gift" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if the wish is already reserved
    const existing = await Reservation.findOne({ wishlist_id: wishlistId, wish_id: wishId });
    if (existing) {
      return new Response(
        JSON.stringify({ error: "Already reserved" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create the new reservation
    const newReservation = await Reservation.create({
      wishlist_id: wishlistId,
      wish_id: wishId,
      user_email: session.user.email,
      user_id: session.user.id,
      reservedBy: session.user.email,
    });

    

    // Return the created reservation with a success message
    return new Response(
      JSON.stringify({ message: "Reserved", reservation: newReservation }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in reservation:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

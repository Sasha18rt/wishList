// app/api/user/recent-wishlists/route.ts
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

// ---- Lean типи для безпечного .lean() ----
type LeanWish = {
  image_url?: string | null;
};

type LeanOwner = {
  _id: any;
  name?: string | null;
  nickname?: string | null;
  email?: string | null;
  image?: string | null;
};

type LeanWishlistPop = {
  _id: any;
  title?: string | null;
  theme?: string | null;
  wishes?: LeanWish[];
  user_id?: LeanOwner | null;
} | null;

type LeanRecentlyViewed = {
  wishlistId?: LeanWishlistPop;
  viewedAt: Date;
};

type LeanUserWithRecent = {
  _id: any;
  email: string;
  recentlyViewed?: LeanRecentlyViewed[];
};

export async function GET() {
  try {
    await connectMongo();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Тягнемо юзера з популяцією вішлистів і їх власників
    const user = (await User.findOne({ email: session.user.email })
      .populate({
        path: "recentlyViewed.wishlistId",
        select: "title theme wishes user_id",
        populate: {
          path: "user_id",
          model: "User",
          select: "name nickname email image",
        },
      })
      .lean()) as LeanUserWithRecent | null;

    if (!user) {
      return NextResponse.json([], { status: 200 });
    }

    const list = (user.recentlyViewed ?? [])
      .map((r) => {
        const wl = r.wishlistId ?? null;
        const owner = wl?.user_id ?? null;

        return {
          wishlistId: wl?._id ? wl._id.toString() : undefined,
          title: wl?.title ?? "Untitled",
          theme: wl?.theme ?? undefined,
          previewImage: wl?.wishes?.[0]?.image_url ?? null,
          viewedAt: r.viewedAt,
          owner: owner
            ? {
                id: owner._id?.toString?.() ?? undefined,
                name: owner.name ?? null,
                nickname: owner.nickname ?? null,
                image: owner.image ?? null,
              }
            : null,
        };
      })
      .filter((x) => !!x.wishlistId) // відсіюємо зламані записи
      .sort(
        (a, b) =>
          new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()
      ).slice(0, 9);

    // за бажанням можна обрізати топ-N
    // .slice(0, 10)

    return NextResponse.json(list, { status: 200 });
  } catch (err) {
    console.error("GET /api/user/recent-wishlists error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

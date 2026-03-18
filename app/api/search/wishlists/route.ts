import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import Wishlist from "@/models/Wishlist";

export const dynamic = "force-dynamic";

const normalizeSearchValue = (value: string) =>
  value.trim().toLowerCase().replace(/^@/, "");

export async function GET(request: Request) {
  try {
    await connectMongo();

    const { searchParams } = new URL(request.url);
    const rawQ = searchParams.get("q") ?? "";
    const q = normalizeSearchValue(rawQ);

    if (!q || q.length < 3) {
      return Response.json({ items: [] });
    }

    const user = await User.findOne({
      $or: [{ nickname: q }, { instagramHandle: q }],
    })
      .select("_id name nickname instagramHandle image")
      .lean<{
        _id: string;
        name?: string;
        nickname: string;
        instagramHandle?: string;
        image?: string;
      } | null>();

    if (!user) {
      return Response.json({ items: [] });
    }

    const wishlists = await Wishlist.find({
      user_id: user._id,
      visibility: "public",
    })
      .select("_id title coverUrl")
      .sort({ updatedAt: -1 })
      .limit(12)
      .lean<
        Array<{
          _id: string;
          title: string;
          coverUrl?: string;
        }>
      >();

    const items = wishlists.map((wishlist) => ({
      wishlistId: String(wishlist._id),
      title: wishlist.title,
      coverUrl: wishlist.coverUrl ?? null,
      href: `/wishlist/${wishlist._id}`,
      owner: {
        name: user.name ?? "",
        nickname: user.nickname,
        instagramHandle: user.instagramHandle ?? "",
        image: user.image ?? "",
      },
    }));

    return Response.json({ items });
  } catch (error) {
    console.error("Wishlist search error:", error);

    return Response.json(
      { error: "Failed to search wishlists" },
      { status: 500 }
    );
  }
}
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Wishlist from "@/models/Wishlist";
import User from "@/models/User";
import { wishSchema } from "@/app/validation/schemas";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});


/**
 * PUT /api/wishlists/:id/wishes/:wishId
 * Оновлює один wish (тепер можна передавати currency)
 */
interface WishUpdatePayload {
  name?: string;
  description?: string;
  product_url?: string;
  price?: string;          // рядок або ""
  currency?: string | null; // 3-літерний код або null
  image_url?: string | null;
  image_public_id?: string | null;
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string; wishId: string } }
) {
  try {
    await connectMongo();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const wishlist = await Wishlist.findOne({
      _id: params.id,
      user_id: user._id,
    });
    if (!wishlist) {
      return NextResponse.json({ error: "Wishlist not found" }, { status: 404 });
    }

    const wish = wishlist.wishes.find(
      (w: any) => w._id.toString() === params.wishId
    );
    if (!wish) {
      return NextResponse.json({ error: "Wish not found" }, { status: 404 });
    }

    // ---------- Парсимо/валідуємо вхід ----------
    const raw = (await req.json()) as WishUpdatePayload;

    // Клієнтська схема: переконайся, що вона містить currency
    const parsed = wishSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Нормалізація вхідних полів
    const name = typeof parsed.data.name === "string" ? parsed.data.name.trim() : undefined;
    const description =
      typeof parsed.data.description === "string" ? parsed.data.description : undefined;
    const product_url =
      typeof parsed.data.product_url === "string" ? parsed.data.product_url : undefined;

    const priceIn = typeof parsed.data.price === "string" ? parsed.data.price.trim() : "";
    // якщо хочеш зберігати null у БД для пустої ціни — постав priceDb = null замість ""
    const priceDb: string | null = priceIn === "" ? "" : String(priceIn);

    // Валюта: upcase + валідація коду
    let currencyIn =
      typeof parsed.data.currency === "string" ? parsed.data.currency.trim().toUpperCase() : null;

    // Узгодженість: якщо є ціна → валюта обов’язкова; якщо ціни нема → валюта = null
    if (priceIn) {
      if (!currencyIn || !/^[A-Z]{3}$/.test(currencyIn)) {
        return NextResponse.json(
          { error: "Currency is required and must be a 3-letter code when price is set" },
          { status: 400 }
        );
      }
    } else {
      currencyIn = null;
    }

    const image_url =
      typeof parsed.data.image_url === "string" && parsed.data.image_url
        ? parsed.data.image_url
        : parsed.data.image_url === null
        ? null
        : undefined;

    const image_public_id =
      typeof parsed.data.image_public_id === "string" && parsed.data.image_public_id
        ? parsed.data.image_public_id
        : parsed.data.image_public_id === null
        ? null
        : undefined;

    // ---------- Видалення старого зображення (якщо змінено public_id) ----------
    if (
      image_url !== undefined &&
      image_public_id !== undefined &&
      wish.image_public_id &&
      image_public_id &&
      wish.image_public_id !== image_public_id
    ) {
      try {
        // await cloudinary.uploader.destroy(wish.image_public_id);
      } catch (err) {
        console.warn("Failed to delete old image", err);
      }
    }

    // ---------- Оновлюємо поля ----------
    if (name !== undefined) wish.name = name;
    if (description !== undefined) wish.description = description;
    if (product_url !== undefined) wish.product_url = product_url;

    if (priceDb !== null) {
      // збережемо як РЯДОК або "" (консистентно з POST)
      wish.price = priceDb; // або: priceIn === "" ? null : priceIn
    }
    // Валюта оновлюється незалежно, але узгоджено з ціною (див. нормалізацію вище)
    wish.currency = currencyIn;

    if (image_url !== undefined) wish.image_url = image_url; // string | null
    if (image_public_id !== undefined) wish.image_public_id = image_public_id; // string | null

    await wishlist.save();

    // ---------- Нормалізуємо відповідь для фронта ----------
    const updated = wish.toObject();
    return NextResponse.json(
      {
        ...updated,
        price: updated.price?.toString?.() ?? "",
        currency: updated.currency ?? null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating wish:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
/**
 * DELETE /api/wishlists/:id/wishes/:wishId
 * Видаляє конкретний wish (разом з картинкою, якщо була)
 */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; wishId: string } }
) {
  try {
    await connectMongo();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    const wishlist = await Wishlist.findOne({
      _id: params.id,
      user_id: user._id,
    });
    if (!wishlist) {
      return new NextResponse(JSON.stringify({ error: "Wishlist not found" }), {
        status: 404,
      });
    }

    const wish = wishlist.wishes.find(
      (w: any) => w._id.toString() === params.wishId
    );
    if (!wish) {
      return new NextResponse(JSON.stringify({ error: "Wish not found" }), {
        status: 404,
      });
    }

    if (wish.image_public_id) {
      try {
        await cloudinary.uploader.destroy(wish.image_public_id);
      } catch (err) {
        console.warn("Failed to delete image from Cloudinary", err);
      }
    }

    wishlist.wishes = wishlist.wishes.filter(
      (w: any) => w._id.toString() !== params.wishId
    );
    await wishlist.save();

    return new NextResponse(
      JSON.stringify({ message: "Wish deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting wish:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}

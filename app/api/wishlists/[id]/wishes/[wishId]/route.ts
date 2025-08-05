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

export async function PUT(
  req: Request,
  { params }: { params: { id: string; wishId: string } }
) {
  try {
    await connectMongo();

    // — Перевірка автентифікації
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // — Знаходимо користувача
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // — Знаходимо wishlist і конкретний wish
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

    // — Парсимо JSON-тіло запиту (без multipart/form-data)
    const data = await req.json();
    const parsed = wishSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const {
      name,
      description,
      product_url,
      price,
      image_url,
      image_public_id,
    } = parsed.data;

    // — Якщо прийшла нова картинка, що відрізняється від старої, видаляємо стару
    if (
      image_url &&
      image_public_id &&
      wish.image_public_id &&
      wish.image_public_id !== image_public_id
    ) {
      try {
        await cloudinary.uploader.destroy(wish.image_public_id);
      } catch (err) {
        console.warn("Failed to delete old image", err);
      }
    }

    // — Оновлюємо тільки ті поля, що прийшли в запиті
    if (name !== undefined)              wish.name = name;
    if (description !== undefined)       wish.description = description;
    if (product_url !== undefined)       wish.product_url = product_url;
    // для price: порожній рядок приводимо в null
    if (price !== undefined)             wish.price = price === "" ? null : price;
    // для зображень: якщо нема в запиті — лишаємо старі
    if (image_url !== undefined)         wish.image_url = image_url || null;
    if (image_public_id !== undefined)   wish.image_public_id = image_public_id || null;

    // — Зберігаємо оновлений wishlist
    await wishlist.save();

    return NextResponse.json(wish.toObject(), { status: 200 });
  } catch (error) {
    console.error("Error updating wish:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * @desc Delete a specific wish from a wishlist
 * @route DELETE /api/wishlists/:id/wishes/:wishId
 * @access Private (Authenticated Users)
 */

import { Readable } from "stream";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; wishId: string } }
) {
  try {
    await connectMongo();

    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "User not found" }),
        { status: 404 }
      );
    }

    const wishlist = await Wishlist.findOne({
      _id: params.id,
      user_id: user._id,
    });
    if (!wishlist) {
      return new NextResponse(
        JSON.stringify({ error: "Wishlist not found" }),
        { status: 404 }
      );
    }

    const wish = wishlist.wishes.find(
      (wish: any) => wish._id.toString() === params.wishId
    );
    if (!wish) {
      return new NextResponse(
        JSON.stringify({ error: "Wish not found" }),
        { status: 404 }
      );
    }

    //If the wish contains image_public_id, delete the image from Cloudinary

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
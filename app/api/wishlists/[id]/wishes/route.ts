import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Wishlist from "@/models/Wishlist";
import User from "@/models/User";
import { wishSchema } from "@/app/validation/schemas"; // перевірка одного wish
import { NextResponse } from "next/server";

// допоміжне: нормалізація валюти (3 літери у верхньому регістрі)


/**
 * GET /api/wishlists/:id/wishes
 * Повертає всі wishes поточного користувача для конкретного wishlist
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (!params.id) {
    return new Response(JSON.stringify({ error: "Missing wishlist id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
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

    // Нормалізуємо віддачу: price — рядок, currency — (може бути null/undefined)
    const formatted = wishlist.wishes.map((wish: any) => {
      const w = wish.toObject();
      return {
        ...w,
        price: w.price?.toString() ?? "",
        currency: w.currency ?? null,
      };
    });

    return new Response(JSON.stringify(formatted), {
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
 * POST /api/wishlists/:id/wishes
 * Створює новий wish у вказаному wishlist (власник)
 * Тепер приймає також currency (опційно)
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
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



    // ---- Витягаємо поля з тіла запиту (НЕ загубити currency!) ----
   interface WishPayload {
  name: string;
  description?: string;
  product_url?: string;
  price?: string;
  currency?: string;
  image_url?: string;
  image_public_id?: string;
}

const data = (await req.json()) as WishPayload;

let {
  name,
  description = "",
  product_url = "",
  price = "",
  currency = null,
  image_url = "",
  image_public_id = "",
} = data;


    // Базові перевірки (мінімальні; фронт уже валідовує wishSchema)
    if (typeof name !== "string" || !name.trim()) {
      return new Response(JSON.stringify({ error: "Name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Нормалізація price як РЯДКА (може бути "")
    if (typeof price !== "string") price = "";
    const priceStr = price.trim();

    // Якщо є ціна — повинна бути валюта (3-літерний код)
    let currencyStr: string | null = null;
    if (priceStr) {
      if (typeof currency !== "string") {
        return new Response(
          JSON.stringify({ error: "Currency is required when price is set" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      const c = currency.trim().toUpperCase();
      if (!/^[A-Z]{3}$/.test(c)) {
        return new Response(
          JSON.stringify({ error: "Invalid currency code" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      currencyStr = c;
    }

    // Опційно: whitelist валют
    // const ALLOWED = new Set(["USD","EUR","GBP","CAD","UAH","PLN","CZK","TRY"]);
    // if (currencyStr && !ALLOWED.has(currencyStr)) { ...400 }

    // Збираємо нове бажання
    const newWish = {
      name: name.trim(),
      description: typeof description === "string" ? description : "",
      product_url:
        typeof product_url === "string" && product_url ? product_url : "",
      price: priceStr,            // ← строго РЯДОК ("" якщо відсутня)
      currency: currencyStr,      // ← 3-літерний код або null
      image_url:
        typeof image_url === "string" && image_url ? image_url : null,
      image_public_id:
        typeof image_public_id === "string" && image_public_id
          ? image_public_id
          : null,
      added_at: new Date(),
    };

    wishlist.wishes.push(newWish as any);
    await wishlist.save();

    // Повертаємо саме створений елемент з нормалізацією
    const created = wishlist.wishes[wishlist.wishes.length - 1].toObject();
    const responseBody = {
      ...created,
      price: created.price?.toString() ?? "",
      currency: created.currency ?? null,
    };

    return new Response(JSON.stringify(responseBody), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating wish:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

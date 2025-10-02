import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import connectMongo from "@/libs/mongoose";
import Wishlist from "@/models/Wishlist";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();

    const wishlist = await Wishlist.findById(params.id)
      .populate("user_id", "name email")
      .lean();

    if (!wishlist) return new Response("Not found", { status: 404 });

    const ownerName =
      (wishlist as any).user_id?.name ||
      (wishlist as any).user_id?.email ||
      "Anonymous";

    const ownerInitial = ownerName[0]?.toUpperCase() || "A";

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            width: "100%",
            background: "linear-gradient(135deg, #0f172a, #1e293b)",
            color: "#f8fafc",
            padding: "60px",
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
            textAlign: "center",
          }}
        >
          {/* Заголовок */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              fontSize: 100,
              fontWeight: 1000,
              marginBottom: 12,
              color: "#fff",
              maxWidth: "90%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              textShadow: "0 0 40px rgba(250, 204, 21, 0.4)",
            }}
          >
            {(wishlist as any).title}
          </div>

          {/* Акцентна лінія */}
          <div
            style={{
              display: "flex",
              height: 4,
              width: 160,
              borderRadius: 2,
              marginBottom: 28,
              background: "linear-gradient(to right, #facc15, #f472b6)",
            }}
          />

          {/* Аватар + ім’я */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #facc15, #f472b6)",
                fontSize: 36,
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              {ownerInitial}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 28,
                opacity: 0.9,
              }}
            >
              by {ownerName}
            </div>
          </div>

          {/* Підзаголовок */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              fontSize: 22,
              padding: "8px 20px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              marginBottom: 40,
            }}
          >
            A wishlist made with ❤️ on Wishlify
          </div>

          {/* Футер */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              fontSize: 22,
              opacity: 0.7,
              borderTop: "1px solid rgba(255,255,255,0.2)",
              paddingTop: 20,
              WebkitBackgroundClip: "text",
            }}
          >
            wishlify.me
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (err) {
    console.error("OG image error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

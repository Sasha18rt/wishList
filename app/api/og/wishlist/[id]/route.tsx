// /app/api/og/wishlist/[id]/route.ts
import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";
import connectMongo from "@/libs/mongoose";
import Wishlist from "@/models/Wishlist";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();

    const id = params.id;
    if (!id || !/^[a-f\d]{24}$/i.test(id)) {
      return new Response("Bad id", { status: 400 });
    }

    const wishlist = await Wishlist.findById(id)
      .select("title user_id wishes visibility")
      .populate("user_id", "name email image")
      .lean();

    if (!wishlist) return new Response("Not found", { status: 404 });

    const baseUrl = req.nextUrl.origin;

    const ownerName =
      (wishlist as any).user_id?.name ||
      (wishlist as any).user_id?.email ||
      "Anonymous";

    const ownerInitial = (ownerName[0] || "A").toUpperCase();

    const rawUserImage: string | undefined = (wishlist as any).user_id?.image || undefined;
    const userImage =
      rawUserImage && /^https?:\/\//i.test(rawUserImage)
        ? rawUserImage
        : rawUserImage
        ? `${baseUrl}${rawUserImage.startsWith("/") ? "" : "/"}${rawUserImage}`
        : undefined;

    const title: string = (wishlist as any).title || "Wishlist";
    const visibility: string = (wishlist as any).visibility || "private";
    const isPublic = visibility === "public";

    const wishes = Array.isArray((wishlist as any).wishes)
      ? (wishlist as any).wishes
      : [];
    const wishesCount = wishes.length;

    const pageUrl = `${baseUrl}/wishlist/${id}`;
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
      pageUrl
    )}`;

    const len = title.length;
    const titleFontSize = len > 60 ? 64 : len > 36 ? 80 : 96;

    const root = (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          background: "linear-gradient(135deg, #0f172a, #1e293b)",
          color: "#f8fafc",
          padding: 56,
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        {/* Заголовок + лінія */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 12,
            marginTop: 4,
          }}
        >
          <div
            style={{
              fontSize: titleFontSize,
              fontWeight: 1000,
              lineHeight: 1.05,
              maxWidth: 980,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </div>

          <div
            style={{
              display: "flex",
              height: 4,
              width: 180,
              borderRadius: 2,
              background: "linear-gradient(to right, #facc15, #f472b6)",
              boxShadow: "0 0 24px rgba(255,255,255,0.25)",
            }}
          />
        </div>

        {/* Автор + бейджі */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            marginTop: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            {userImage ? (
              <img
                src={userImage}
                width={72}
                height={72}
                alt={ownerName}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  objectFit: "cover",
                  boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
                  border: "3px solid rgba(255,255,255,0.65)",
                  background: "#0f172a",
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #facc15, #f472b6)",
                  color: "#0f172a",
                  fontSize: 36,
                  fontWeight: 800,
                  boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
                }}
              >
                {ownerInitial}
              </div>
            )}

            {/* !!! ЄДИНИЙ текстовий вузол, без "by " + {ownerName} */}
            <div
              style={{
                fontSize: 28,
                opacity: 0.92,
              }}
            >
              {"by " + ownerName}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 4,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 20,
                padding: "6px 12px",
                borderRadius: 999,
                background: isPublic
                  ? "rgba(34,197,94,0.18)"
                  : "rgba(248,113,113,0.18)",
                color: isPublic ? "#86efac" : "#fecaca",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {isPublic ? "Public" : "Private"}
            </div>

            {/* !!! Також один текстовий вузол */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 20,
                padding: "6px 12px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.10)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {`${wishesCount} ${wishesCount === 1 ? "wish" : "wishes"}`}
            </div>
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
            marginTop: 32,
          }}
        >
          {/* один вузол */}
          {"Wishlist made with ❤️ on Wishlify"}
        </div>

        {/* Футер із QR та URL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            paddingTop: 18,
            borderTop: "1px solid rgba(255,255,255,0.25)",
            marginTop: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <img
              src={qrSrc}
              width={120}
              height={120}
              alt="QR"
              style={{
                width: 120,
                height: 120,
                borderRadius: 10,
                background: "#fff",
                padding: 6,
                boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
              }}
            />

            <div
              style={{
                fontSize: 18,
                opacity: 0.85,
                maxWidth: 520,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {pageUrl}
            </div>
          </div>

          <div
            style={{
              fontSize: 22,
              opacity: 0.85,
            }}
          >
            {"wishlify.me"}
          </div>
        </div>
      </div>
    );

    return new ImageResponse(root, {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err: any) {
    if (err?.name === "CastError") {
      return new Response("Bad id", { status: 400 });
    }
    console.error("OG image error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

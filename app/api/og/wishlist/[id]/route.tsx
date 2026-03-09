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
      .select("title user_id wishes")
      .populate("user_id", "name email")
      .lean();

    if (!wishlist) {
      return new Response("Not found", { status: 404 });
    }

    const title = (wishlist as any).title || "Wishlist";
    const ownerName =
      (wishlist as any).user_id?.name ||
      (wishlist as any).user_id?.email ||
      "Anonymous";

    const wishesCount = Array.isArray((wishlist as any).wishes)
      ? (wishlist as any).wishes.length
      : 0;

    const titleLength = title.length;
    const titleFontSize =
      titleLength > 80 ? 54 : titleLength > 50 ? 68 : 82;

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            background:
              "linear-gradient(135deg, #f8f4ff 0%, #ffffff 45%, #f4f8ff 100%)",
            color: "#111111",
            padding: "40px",
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              justifyContent: "space-between",
              borderRadius: "32px",
              padding: "48px",
              background: "rgba(255,255,255,0.88)",
              border: "1px solid rgba(122,3,208,0.10)",
              boxShadow: "0 20px 60px rgba(122,3,208,0.10)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 30,
                  fontWeight: 800,
                  color: "#7A03D0",
                  letterSpacing: "-0.03em",
                }}
              >
                Wishlify
              </div>

              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  color: "#6b7280",
                  padding: "10px 16px",
                  borderRadius: "999px",
                  background: "#f6f0ff",
                }}
              >
                {`${wishesCount} ${wishesCount === 1 ? "wish" : "wishes"}`}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "22px",
                maxWidth: "920px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: titleFontSize,
                  fontWeight: 900,
                  lineHeight: 1.03,
                  letterSpacing: "-0.045em",
                  color: "#111111",
                }}
              >
                {title}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: 30,
                  color: "#4b5563",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: "12px",
                    height: "12px",
                    borderRadius: "999px",
                    background: "#7A03D0",
                  }}
                />
                {`by ${ownerName}`}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid #ece7f5",
                paddingTop: "24px",
                fontSize: 22,
                color: "#6b7280",
              }}
            >
              <div style={{ display: "flex" }}>
                Create and share gift wishlists
              </div>
              <div style={{ display: "flex", color: "#111111", fontWeight: 600 }}>
                wishlify.me
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (err: any) {
    if (err?.name === "CastError") {
      return new Response("Bad id", { status: 400 });
    }

    console.error("OG image error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import connectMongo from "@/libs/mongoose";
import Wishlist from "@/models/Wishlist";

export const runtime = "edge";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectMongo();
  const wishlist = await Wishlist.findById(params.id);

  if (!wishlist) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(to right, #facc15, #f472b6)",
          height: "100%",
          width: "100%",
          textAlign: "center",
          fontSize: 48,
          padding: "50px",
        }}
      >
        <strong>{wishlist.title}</strong>
        <p style={{ fontSize: 24, marginTop: "20px" }}>
          A wishlist made with ❤️ on Wishlify
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

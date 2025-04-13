import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (
      !contentType.includes("multipart/form-data") &&
      !contentType.includes("application/x-www-form-urlencoded")
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid Content-Type. Expected multipart/form-data or application/x-www-form-urlencoded.",
        },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB" },
        { status: 400 }
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    const uploadResult = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      const cloudStream = cloudinary.uploader.upload_stream(
        { folder: "wishlist_uploads" },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result);
        }
      );
      stream.pipe(cloudStream);
    });
    console.log("Cloudinary upload result:", uploadResult.public_id);

    return NextResponse.json({
      imageUrl: uploadResult.secure_url,
      image_public_id: uploadResult.public_id,
    });
  } catch (err) {
    console.error("[UPLOAD_IMAGE]", err);
    return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
  }
}

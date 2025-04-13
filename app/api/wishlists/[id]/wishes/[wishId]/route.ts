import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Wishlist from "@/models/Wishlist";
import User from "@/models/User";
import { wishSchema } from "@/app/validation/schemas";

/**
 * @desc Update a specific wish inside a wishlist
 * @route PUT /api/wishlists/:id/wishes/:wishId
 * @access Private (Authenticated Users)
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string; wishId: string } }
) {
  try {
    await connectMongo();

    const session = await getServerSession(authOptions);
    if (!session)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const user = await User.findOne({ email: session.user.email });
    if (!user)
      return Response.json({ error: "User not found" }, { status: 404 });

    const wishlist = await Wishlist.findOne({
      _id: params.id,
      user_id: user._id,
    });
    if (!wishlist)
      return Response.json({ error: "Wishlist not found" }, { status: 404 });

    const wishIndex = wishlist.wishes.findIndex(
      (wish: any) => wish._id.toString() === params.wishId
    );
    if (wishIndex === -1)
      return Response.json({ error: "Wish not found" }, { status: 404 });

    let updateData: any = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      updateData.name = formData.get("name")?.toString();
      updateData.description = formData.get("description")?.toString();
      updateData.product_url = formData.get("product_url")?.toString();
      updateData.price = formData.get("price")?.toString() || "";

      const file = formData.get("file") as File;
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const stream = Readable.from(buffer);
        const uploadResult = await new Promise<{ secure_url: string; public_id: string }>(
          (resolve, reject) => {
            const cloudStream = cloudinary.uploader.upload_stream(
              { folder: "wishlist_uploads" },
              (error, result) => {
                if (error || !result) return reject(error);
                resolve(result);
              }
            );
            stream.pipe(cloudStream);
          }
        );
        updateData.image_url = uploadResult.secure_url;
        updateData.image_public_id = uploadResult.public_id;
      } else {
        updateData.image_url = formData.get("image_url")?.toString() || undefined;
        updateData.image_public_id = formData.get("image_public_id")?.toString() || undefined;
      }
    } else {
      updateData = await req.json();
    }

    const parsed = wishSchema.safeParse(updateData);
    if (!parsed.success)
      return Response.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );

    const { name, description, image_url, image_public_id, product_url, price } = parsed.data;
    const wish = wishlist.wishes[wishIndex];
    const oldImagePublicId = wish.image_public_id;

    // If a new image was provided and differs from the old one, delete the old image
    if (image_url && image_public_id && oldImagePublicId && oldImagePublicId !== image_public_id) {
      try {
        await cloudinary.uploader.destroy(oldImagePublicId);
      } catch (err) {
        console.warn("Failed to delete old image", err);
      }
    }

    Object.assign(wish, {
      name,
      description,
      image_url: image_url || null,
      image_public_id: image_public_id || null,
      product_url: product_url || "",
      price: price === "" ? null : price,
    });

    await wishlist.save();
    return Response.json(wish.toObject(), { status: 200 });
  } catch (error) {
    console.error("Error updating wish:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * @desc Delete a specific wish from a wishlist
 * @route DELETE /api/wishlists/:id/wishes/:wishId
 * @access Private (Authenticated Users)
 */
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
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
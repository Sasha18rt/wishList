
import connectMongo from "@/libs/mongoose";
import { authOptions } from "@/libs/next-auth";
import Reservation from "@/models/Reservations";
import User from "@/models/User";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";



export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();

    const reservation = await Reservation.findOne({ wish_id: params.id });
    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    const user = await User.findById(reservation.user_id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user from reservation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


  export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();

    // 1) auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2) знайти резервацію: спочатку по _id, fallback по wish_id
    const { id } = params;
    let reservation = null;

    if (mongoose.isValidObjectId(id)) {
      reservation = await Reservation.findById(id);
    }
    if (!reservation) {
      // fallback на старий формат: id у URL = wish_id
      reservation = await Reservation.findOne({ wish_id: id });
    }
    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    // 3) перевірити власника резервації
    if (reservation.user_id?.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "Forbidden: you can only cancel your own reservations" },
        { status: 403 }
      );
    }

    // 4) видалити
    await Reservation.deleteOne({ _id: reservation._id });

    return NextResponse.json({ message: "Reservation cancelled" });
  } catch (error) {
    console.error("Error deleting reservation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
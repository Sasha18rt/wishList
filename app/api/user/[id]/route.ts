import { NextRequest, NextResponse } from 'next/server';
import connectMongo from "@/libs/mongoose";
import  User  from '@/models/User';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectMongo();

  try {
    const user = await User.findById(params.id);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching user', error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectMongo();

  try {
    const data = await req.json();
    const updatedUser = await User.findByIdAndUpdate(params.id, data, { new: true });

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("UPDATE USER ERROR", error);
    return NextResponse.json({ message: "Error updating user", error }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connectMongo();

  try {
    await User.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'User deleted' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting user', error }, { status: 500 });
  }
}

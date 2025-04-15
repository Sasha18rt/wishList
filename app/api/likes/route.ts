import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Instead of creating a reservation, simply return a success message.
  return NextResponse.json({ message: "Like accepted" }, { status: 200 });
}

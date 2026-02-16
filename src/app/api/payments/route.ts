import { Payment } from "@/models/Payment";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.id;

    await connectDB();

    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ payments });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

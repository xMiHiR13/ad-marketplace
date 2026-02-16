import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Channel } from "@/models/Channel";
import { getSession } from "@/lib/session";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    await connectDB();

    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.id);
    const chatId = Number((await params).chatId);

    const { payoutAddress } = await req.json();

    if (!payoutAddress || typeof payoutAddress !== "string") {
      return NextResponse.json(
        { message: "Invalid payout address" },
        { status: 400 },
      );
    }

    const channel = await Channel.findOne({ chatId });

    if (!channel) {
      return NextResponse.json(
        { message: "Channel not found" },
        { status: 404 },
      );
    }

    if (channel.ownerId !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    channel.payoutAddress = payoutAddress;
    await channel.save();

    return NextResponse.json({
      message: "Payout address updated",
      payoutAddress,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to update payout address" },
      { status: 500 },
    );
  }
}

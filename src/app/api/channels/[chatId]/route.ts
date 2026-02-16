import { NextResponse } from "next/server";
import { Channel } from "@/models/Channel";
import { connectDB } from "@/lib/mongoose";
import { getSession } from "@/lib/session";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    await connectDB();

    const session = await getSession();
    const userId = session?.id ? Number(session.id) : null;

    const channel = await Channel.findOne({
      chatId: Number((await params).chatId),
    }).lean();

    if (!channel) {
      return NextResponse.json(
        { message: "Channel not found" },
        { status: 404 },
      );
    }

    const isOwner = userId === channel.ownerId;

    if (!isOwner) {
      channel.managerIds = [];
      channel.payoutAddress = "";
    }

    return NextResponse.json({ channel, isOwner });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch channel" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const session = await getSession();
    const userId = session?.id ? Number(session.id) : null;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const chatId = Number((await params).chatId);

    await connectDB();
    const channel = await Channel.findOne({ chatId });

    if (!channel) {
      return NextResponse.json(
        { message: "Channel not found" },
        { status: 404 },
      );
    }

    // Only owner can delete
    if (channel.ownerId !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await Channel.deleteOne({ chatId });

    return NextResponse.json({ message: "Channel deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to delete channel" },
      { status: 500 },
    );
  }
}

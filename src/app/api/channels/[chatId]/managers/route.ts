import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getSession } from "@/lib/session";
import { Channel } from "@/models/Channel";
import { Deal } from "@/models/Deal";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.id);
    const chatId = Number((await params).chatId);

    const { managerIds } = await req.json();

    // Validate payload
    if (!Array.isArray(managerIds)) {
      return NextResponse.json(
        { message: "managerIds must be an array" },
        { status: 400 },
      );
    }

    if (!managerIds.every((id) => typeof id === "number")) {
      return NextResponse.json(
        { message: "managerIds must contain only numbers" },
        { status: 400 },
      );
    }

    await connectDB();

    const channel = await Channel.findOne({ chatId });

    if (!channel) {
      return NextResponse.json(
        { message: "Channel not found" },
        { status: 404 },
      );
    }

    // Only owner can update managers
    if (channel.ownerId !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    channel.managerIds = managerIds;
    await channel.save();

    await Deal.updateMany(
      { "channel.chatId": chatId },
      { $set: { managerIds } },
    );

    return NextResponse.json({
      message: "Managers updated successfully",
      managerIds: channel.managerIds,
    });
  } catch (error) {
    console.error("PATCH managers error:", error);
    return NextResponse.json(
      { message: "Failed to update managers" },
      { status: 500 },
    );
  }
}

// src/app/api/deals/[id]/start-chat/route.ts

import { Types } from "mongoose";
import { Deal } from "@/models/Deal";
import { DealRole } from "@/types/deal";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getSession } from "@/lib/session";
import { startChat, verifyUserIsAdmin } from "@/lib/tgMethods";
import { Channel } from "@/models/Channel";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.id);

    await connectDB();

    const dealId = (await params).id;
    if (!Types.ObjectId.isValid(dealId)) {
      return NextResponse.json({ message: "Invalid deal ID" }, { status: 400 });
    }

    const deal = await Deal.findById(dealId);
    if (!deal) {
      return NextResponse.json({ message: "Deal not found" }, { status: 404 });
    }

    let partnerRole: DealRole | undefined;
    if (userId === deal.advertiserId) {
      partnerRole = "publisher";
    } else if (
      userId === deal.publisherId ||
      deal.managerIds.includes(userId)
    ) {
      partnerRole = "advertiser";
    }

    if (!partnerRole) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (partnerRole === "advertiser") {
      const { isAdmin, updatedManagerIds } = await verifyUserIsAdmin(
        deal.channel.chatId,
        userId,
        deal.managerIds,
      );

      if (!isAdmin) {
        deal.managerIds = updatedManagerIds!;
        await deal.save();
        await Channel.updateOne(
          { chatId: deal.channel.chatId },
          { $pull: { managerIds: userId } },
        );
        return NextResponse.json(
          { message: "You are no longer an admin of this channel" },
          { status: 403 },
        );
      }
    }

    // Send start chat message to user
    await startChat(userId, deal._id.toString(), partnerRole);

    return NextResponse.json(
      { message: "Start chat message sent" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Start Chat Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

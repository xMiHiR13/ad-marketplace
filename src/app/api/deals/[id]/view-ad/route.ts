// src/app/api/deals/[id]/view-ad/route.ts

import { Types } from "mongoose";
import { Deal } from "@/models/Deal";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getSession } from "@/lib/session";
import { verifyUserIsAdmin, viewAdSubmit } from "@/lib/tgMethods";
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

    // Only publisher, or manager can view
    const isPublisher =
      deal.publisherId === userId || deal.managerIds.includes(userId);
    if (!isPublisher) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (isPublisher) {
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

    // Ad must exist
    if (!deal.ad) {
      return NextResponse.json(
        { message: "No ad submitted yet" },
        { status: 400 },
      );
    }

    // Send ad to user
    await viewAdSubmit(
      userId,
      deal.ad.chatId,
      deal.ad.messageId,
      deal.adType === "postWithForward",
    );

    return NextResponse.json(
      { message: "Ad sent to your PM" },
      { status: 200 },
    );
  } catch (error) {
    console.error("View Ad Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

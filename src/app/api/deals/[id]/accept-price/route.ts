// src/app/api/deals/[id]/accept-price/route.ts

import { Types } from "mongoose";
import { Deal } from "@/models/Deal";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getSession } from "@/lib/session";
import { verifyUserIsAdmin } from "@/lib/tgMethods";
import { Channel } from "@/models/Channel";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.id);
    const dealId = (await params).id;

    await connectDB();

    if (!Types.ObjectId.isValid(dealId)) {
      return NextResponse.json({ message: "Invalid deal ID" }, { status: 400 });
    }

    const deal = await Deal.findById(dealId);

    if (!deal) {
      return NextResponse.json({ message: "Deal not found" }, { status: 404 });
    }

    if (deal.status !== "negotiating" && deal.status !== "price_proposed") {
      return NextResponse.json(
        { message: "Deal cannot be accepted in this state" },
        { status: 400 },
      );
    }

    const isAdvertiser = deal.advertiserId === userId;
    const isPublisher =
      deal.publisherId === userId || deal.managerIds.includes(userId);
    if (!isAdvertiser && !isPublisher) {
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

    // Prevent proposer from accepting their own proposal
    if (
      deal.negotiation &&
      !deal.negotiation.acceptedAt &&
      ((deal.negotiation.proposedBy === "advertiser" && isAdvertiser) ||
        (deal.negotiation.proposedBy === "publisher" && isPublisher))
    ) {
      return NextResponse.json(
        { message: "You cannot accept your own proposal" },
        { status: 403 },
      );
    }

    if (deal.negotiation && !deal.negotiation.acceptedAt) {
      // Accept negotiated price
      deal.price = deal.negotiation.proposedPrice;
      deal.negotiation.acceptedAt = new Date();
    }

    // Apply accepted price
    deal.status = "awaiting_ad_submission";

    await deal.save();

    return NextResponse.json({
      price: deal.price,
      status: deal.status,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to accept price" },
      { status: 500 },
    );
  }
}

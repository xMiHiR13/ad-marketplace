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

    await connectDB();

    const dealId = (await params).id;
    if (!Types.ObjectId.isValid(dealId)) {
      return NextResponse.json({ message: "Invalid deal ID" }, { status: 400 });
    }

    const deal = await Deal.findById(dealId);
    if (!deal) {
      return NextResponse.json({ message: "Deal not found" }, { status: 404 });
    }

    // Only publisher or manager can approve
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

    if (deal.status !== "ad_under_review") {
      return NextResponse.json(
        { message: "Deal is not under review" },
        { status: 400 },
      );
    }

    // Ad must exist
    if (!deal.ad) {
      return NextResponse.json(
        { message: "No ad submitted yet" },
        { status: 400 },
      );
    }

    deal.status = "awaiting_payment";
    deal.ad.approvedAt = new Date();
    deal.ad.rejectedAt = undefined;

    await deal.save();

    return NextResponse.json({
      status: deal.status,
      approvedAt: deal.ad.approvedAt,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to approve ad" },
      { status: 500 },
    );
  }
}

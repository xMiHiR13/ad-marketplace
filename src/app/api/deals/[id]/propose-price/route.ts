import { Types } from "mongoose";
import { Deal } from "@/models/Deal";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getSession } from "@/lib/session";
import { DealRole } from "@/types/deal";
import { verifyUserIsAdmin } from "@/lib/tgMethods";
import { Channel } from "@/models/Channel";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const session = await getSession();
    const userId = session?.id ? Number(session.id) : null;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { price } = await req.json();

    if (!price || price <= 0) {
      return NextResponse.json({ message: "Invalid price" }, { status: 400 });
    }

    const dealId = (await params).id;
    if (!Types.ObjectId.isValid(dealId)) {
      return NextResponse.json({ message: "Invalid deal ID" }, { status: 400 });
    }

    const deal = await Deal.findById(dealId);
    if (!deal) {
      return NextResponse.json({ message: "Deal not found" }, { status: 404 });
    }

    const role: DealRole | null =
      deal.advertiserId === userId
        ? "advertiser"
        : deal.publisherId === userId || deal.managerIds.includes(userId)
          ? "publisher"
          : null;
    if (!role) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (role === "publisher") {
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

    if (!["negotiating", "price_proposed"].includes(deal.status)) {
      return NextResponse.json(
        { message: "Deal is not negotiable" },
        { status: 400 },
      );
    }

    if (!deal.duration || deal.duration <= 0) {
      return NextResponse.json(
        { message: "Set duration first" },
        { status: 400 },
      );
    }

    deal.negotiation = {
      proposedPrice: price,
      proposedBy: role,
      proposedAt: new Date(),
    };

    deal.status = "price_proposed";

    await deal.save();

    return NextResponse.json({
      negotiation: deal.negotiation,
      status: deal.status,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to propose price" },
      { status: 500 },
    );
  }
}

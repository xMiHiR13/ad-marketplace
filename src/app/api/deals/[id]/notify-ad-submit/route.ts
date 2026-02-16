// src/app/api/deals/[id]/notify-ad-submit/route.ts

import { Types } from "mongoose";
import { Deal } from "@/models/Deal";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getSession } from "@/lib/session";
import { notifyAdSubmit } from "@/lib/tgMethods";

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

    if (deal.advertiserId !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (
      deal.status !== "awaiting_ad_submission" &&
      deal.status !== "ad_rejected"
    ) {
      return NextResponse.json(
        { message: "Deal is not awaiting ad submission" },
        { status: 400 },
      );
    }

    // Send Telegram bot message for ad
    await notifyAdSubmit(userId, deal.id);

    return NextResponse.json({ message: "Notification sent successfully" });
  } catch (error) {
    console.error("Notify Ad Submit Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

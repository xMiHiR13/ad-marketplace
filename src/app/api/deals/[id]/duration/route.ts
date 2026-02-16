import { Types } from "mongoose";
import { Deal } from "@/models/Deal";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getSession } from "@/lib/session";

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

    const { duration } = await req.json();

    if (!duration || duration <= 0) {
      return NextResponse.json(
        { message: "Invalid duration" },
        { status: 400 },
      );
    }

    const dealId = (await params).id;
    if (!Types.ObjectId.isValid(dealId)) {
      return NextResponse.json({ message: "Invalid deal ID" }, { status: 400 });
    }

    const deal = await Deal.findById(dealId);
    if (!deal) {
      return NextResponse.json({ message: "Deal not found" }, { status: 404 });
    }

    // Only advertiser can update duration
    if (deal.advertiserId !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Only during negotiation stage
    if (!["negotiating", "price_proposed"].includes(deal.status)) {
      return NextResponse.json(
        { message: "Cannot update duration at this stage" },
        { status: 400 },
      );
    }

    // Update duration
    deal.duration = duration;

    // Reset negotiation if exists
    deal.negotiation = undefined;

    // Move back to negotiating state
    deal.status = "negotiating";

    await deal.save();

    return NextResponse.json({
      duration: duration,
      message: "Duration updated",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to update duration" },
      { status: 500 },
    );
  }
}
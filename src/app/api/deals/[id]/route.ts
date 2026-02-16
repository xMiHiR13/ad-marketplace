import { Types } from "mongoose";
import { Deal } from "@/models/Deal";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getSession } from "@/lib/session";

export async function GET(
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

    const dealId = (await params).id;

    if (!Types.ObjectId.isValid(dealId)) {
      return NextResponse.json({ message: "Invalid deal ID" }, { status: 400 });
    }

    const deal = await Deal.findById(dealId).lean();

    if (!deal) {
      return NextResponse.json({ message: "Deal not found" }, { status: 404 });
    }

    const isAdvertiser = deal.advertiserId === userId;
    const isPublisher = deal.publisherId === userId;

    if (!isAdvertiser && !isPublisher) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      deal: {
        ...deal,
        id: deal._id.toString(),
      },
      role: isAdvertiser ? "advertiser" : "publisher",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch deal" },
      { status: 500 },
    );
  }
}

import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getSession } from "@/lib/session";
import { Campaign } from "@/models/Campaign";

// GET campaign by ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  try {
    const session = await getSession();
    const userId = session?.id ? Number(session.id) : null;

    await connectDB();

    const { campaignId } = await params;
    if (!Types.ObjectId.isValid(campaignId)) {
      return NextResponse.json(
        { message: "Invalid campaign ID" },
        { status: 400 }
      );
    }

    const campaign = await Campaign.findById(campaignId).lean();

    if (!campaign) {
      return NextResponse.json(
        { message: "Campaign not found" },
        { status: 404 },
      );
    }

    const campaignObj = {
      ...campaign,
      id: campaign._id.toString(),
    };
    delete (campaignObj as any)._id;
    delete (campaignObj as any).__v;

    const isOwner = userId === campaign.ownerId;

    return NextResponse.json({ campaign: campaignObj, isOwner });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch campaign" },
      { status: 500 },
    );
  }
}

// DELETE campaign by ID
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  try {
    const session = await getSession();
    const userId = session?.id ? Number(session.id) : null;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { campaignId } = await params;
    await connectDB();

    if (!Types.ObjectId.isValid(campaignId)) {
      return NextResponse.json(
        { message: "Invalid campaign ID" },
        { status: 400 }
      );
    }

    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return NextResponse.json(
        { message: "Campaign not found" },
        { status: 404 },
      );
    }

    if (campaign.ownerId !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Delete the campaign
    await Campaign.findByIdAndDelete(campaignId);

    return NextResponse.json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to delete campaign" },
      { status: 500 },
    );
  }
}

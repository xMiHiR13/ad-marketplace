import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getSession } from "@/lib/session";
import { Campaign } from "@/models/Campaign";

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ownerId = Number(session.id);

    const {
      title,
      description,
      budgetMin,
      budgetMax,
      category,
      minSubscribers,
      minPostViews,
      minStoryViews,
      adTypes,
      languages,
    } = await req.json();

    // Basic server validation
    if (
      !title ||
      !description ||
      !budgetMin ||
      !budgetMax ||
      !adTypes?.length
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (budgetMax < budgetMin) {
      return NextResponse.json(
        { error: "Invalid budget range" },
        { status: 400 },
      );
    }

    await connectDB();

    const campaign = await Campaign.create({
      ownerId,
      title,
      description,
      budgetMin,
      budgetMax,
      category,
      requirements: {
        minSubscribers,
        minPostViews,
        minStoryViews,
        adTypes,
        languages,
      },
    });

    return NextResponse.json(
      {
        campaignId: campaign._id.toString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create Campaign Error:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();

    // Fetch only active campaigns
    const campaigns = await Campaign.find({ status: "active" })
      .sort({
        createdAt: -1,
      })
      .lean();

    const sanitized = campaigns.map((c) => ({ ...c, id: c._id.toString() }));

    return NextResponse.json({ campaigns: sanitized }, { status: 200 });
  } catch (error) {
    console.error("Fetch Campaigns Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 },
    );
  }
}

import { Deal } from "@/models/Deal";
import { Payment } from "@/models/Payment";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Channel } from "@/models/Channel";
import { Campaign } from "@/models/Campaign";

export async function GET() {
  try {
    await connectDB();

    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.id;

    const channels = await Channel.find(
      { ownerId: userId },
      { chatId: 1, title: 1, username: 1, photo: 1, _id: 0 },
    );

    const campaigns = await Campaign.find(
      { ownerId: userId },
      { _id: 1, title: 1, budgetMin: 1, budgetMax: 1, category: 1 },
    ).lean();

    // Optional: map _id to id for frontend
    const formattedCampaigns = campaigns.map((c) => ({
      id: c._id.toString(),
      title: c.title,
      budgetMin: c.budgetMin,
      budgetMax: c.budgetMax,
      category: c.category,
    }));

    const totalDeals = await Deal.countDocuments({
      $or: [{ advertiserId: userId }, { publisherId: userId }],
    });

    const activeDeals = await Deal.countDocuments({
      $or: [{ advertiserId: userId }, { publisherId: userId }],
      status: { $nin: ["completed", "cancelled"] },
    });

    const totalSpentAgg = await Payment.aggregate([
      { $match: { userId, type: "sent" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalEarnedAgg = await Payment.aggregate([
      { $match: { userId, type: "received" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalSpent = totalSpentAgg[0]?.total || 0;
    const totalEarned = totalEarnedAgg[0]?.total || 0;

    return NextResponse.json({
      stats: {
        totalDeals,
        activeDeals,
        totalSpent,
        totalEarned,
      },
      channels,
      campaigns: formattedCampaigns,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

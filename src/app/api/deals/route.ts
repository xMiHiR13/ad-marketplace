// src/app/api/deals/route.ts

import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getSession } from "@/lib/session";
import { Channel } from "@/models/Channel";
import { Campaign } from "@/models/Campaign";
import { Deal } from "@/models/Deal";
import { DealRole, DEAL_STATUS } from "@/types/deal";

const TERMINAL_DEAL_STATUS = [
  "completed",
  "refunded_edit",
  "refunded_delete",
  "cancelled",
];

export async function POST(req: Request) {
  try {
    // Authenticate user
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = Number(session.id);

    // Parse request
    const { campaignId, channelId, adType } = await req.json();
    if (!channelId || !adType) {
      return NextResponse.json(
        { error: "channelId and adType are required" },
        { status: 400 },
      );
    }

    await connectDB();

    // Fetch channel and validate adType
    const channel = await Channel.findOne({ chatId: channelId });
    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const price = channel.pricing[adType as keyof typeof channel.pricing];
    if (price === undefined) {
      return NextResponse.json(
        { error: `Ad type "${adType}" not available on this channel` },
        { status: 400 },
      );
    }
    
    if (adType === "story") {
      return NextResponse.json(
        { error: `Story ad type is not supported yet.` },
        { status: 400 },
      );
    }

    const isChannelOwner = channel.ownerId === userId;
    let dealData: any = {
      advertiserId: userId, // default, may change if campaign
      publisherId: channel.ownerId,
      managerIds: channel.managerIds,
      channel: {
        chatId: channel.chatId,
        title: channel.title,
        link: channel.link,
        payoutAddress: channel.payoutAddress,
        photo: channel.photo,
        username: channel.username,
      },
      adType,
      price,
      duration: 1,
      status: "negotiating", // initial status
      schedule: {}, // empty schedule object
      ad: {}, // empty ad object
    };

    if (campaignId) {
      // Channel owner applies to a campaign
      if (!isChannelOwner) {
        return NextResponse.json(
          { error: "Only the channel owner can apply to a campaign" },
          { status: 403 },
        );
      }

      if (!Types.ObjectId.isValid(campaignId)) {
        return NextResponse.json(
          { message: "Invalid campaign ID" },
          { status: 400 },
        );
      }

      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        return NextResponse.json(
          { error: "Campaign not found" },
          { status: 404 },
        );
      }

      dealData = {
        ...dealData,
        advertiserId: campaign.ownerId, // campaign owner is advertiser
        publisherId: userId, // channel owner is publisher
        campaign: {
          id: campaign._id.toString(),
          title: campaign.title,
          description: campaign.description,
        },
      };
    } else {
      // Advertiser applies to channel
      if (isChannelOwner) {
        return NextResponse.json(
          {
            message: "Channel owner cannot apply as advertiser to own channel",
          },
          { status: 400 },
        );
      }
      // Prevent duplicate for same channel + adType
      const existingDeal = await Deal.findOne({
        "channel.chatId": channel.chatId,
        adType,
        advertiserId: userId,
        status: { $nin: TERMINAL_DEAL_STATUS },
      });
      if (existingDeal) {
        return NextResponse.json(
          { error: "You have already requested this ad type on this channel" },
          { status: 400 },
        );
      }
    }

    // Prevent publisher from being the same as advertiser
    if (dealData.publisherId === dealData.advertiserId) {
      return NextResponse.json(
        { error: "Publisher and advertiser cannot be the same user" },
        { status: 400 },
      );
    }

    const deal = await Deal.create(dealData);

    return NextResponse.json({ id: deal._id.toString() }, { status: 201 });
  } catch (err) {
    console.error("Failed to create deal:", err);
    return NextResponse.json(
      { error: "Failed to create deal" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    const userId = session?.id ? Number(session.id) : null;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Validate status if provided
    if (status && !DEAL_STATUS.includes(status as any)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    // Build query
    const query: any = {
      $or: [
        { advertiserId: userId },
        { publisherId: userId },
        { managerIds: userId },
      ],
    };

    if (status) {
      query.status = status;
    }

    const deals = await Deal.find(query, {
      _id: 1,
      advertiserId: 1,
      publisherId: 1,
      managerIds: 1,
      status: 1,
      adType: 1,
      price: 1,
      createdAt: 1,
      channel: {
        title: 1,
        photo: 1,
      },
      campaign: {
        title: 1,
      },
    })
      .sort({ createdAt: -1 })
      .lean();

    // Transform to DealCardType
    const formattedDeals = deals.map((deal: any) => {
      let role: DealRole = "advertiser";

      if (deal.advertiserId === userId) {
      } else if (deal.publisherId === userId) {
        role = "publisher";
      } else {
        role = "manager";
      }

      return {
        id: deal._id.toString(),
        status: deal.status,
        adType: deal.adType,
        price: deal.price,
        createdAt: deal.createdAt,
        channel: {
          title: deal.channel.title,
          photo: deal.channel.photo,
        },
        campaign: deal.campaign ? { title: deal.campaign.title } : undefined,
        role,
      };
    });

    return NextResponse.json({ deals: formattedDeals });
  } catch (error) {
    console.error("Failed to fetch user deals:", error);

    return NextResponse.json(
      { message: "Failed to fetch deals" },
      { status: 500 },
    );
  }
}

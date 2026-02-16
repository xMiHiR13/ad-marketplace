import { NextResponse } from "next/server";
import { Channel } from "@/models/Channel";
import { connectDB } from "@/lib/mongoose";
import { getSession } from "@/lib/session";
import { verifyUserIsOwner } from "@/lib/tgMethods";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const ownerId = Number(session.id);

    const {
      chatId,
      title,
      username,
      photo,
      link,
      pricing,
      managerIds,
      payoutAddress,
      stats,
    } = await req.json();

    await verifyUserIsOwner(chatId, ownerId);

    await connectDB();

    // Prevent duplicate
    const existing = await Channel.findOne({ chatId });
    if (existing) {
      return NextResponse.json(
        { message: "Channel already listed" },
        { status: 400 },
      );
    }

    const channel = await Channel.create({
      chatId,
      title,
      username,
      photo,
      link,
      pricing,
      ownerId,
      managerIds,
      payoutAddress,
      stats,
    });

    return NextResponse.json({ chatId }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create channel" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const channels = await Channel.find(
      {},
      {
        chatId: 1,
        title: 1,
        username: 1,
        photo: 1,
        pricing: 1,
        stats: 1,
      },
    )
      .sort({
        createdAt: -1,
      })
      .lean();

    return NextResponse.json({ channels }, { status: 200 });
  } catch (error) {
    console.error("Fetch Channels Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch channels" },
      { status: 500 },
    );
  }
}

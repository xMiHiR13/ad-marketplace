import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { connectDB } from "@/lib/mongoose";
import {
  getChannelDetails,
  verifyBotIsAdmin,
  verifyUserIsOwner,
} from "@/lib/tgMethods";
import { Channel } from "@/models/Channel";

export async function POST(req: Request) {
  try {
    const { chatId } = await req.json();

    if (!chatId) {
      return NextResponse.json(
        { error: "chatId is required" },
        { status: 400 },
      );
    }

    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    await verifyBotIsAdmin(chatId);
    await verifyUserIsOwner(chatId, Number(session.id));

    const channelDetails = await getChannelDetails(chatId);

    // Prevent duplicate
    const existing = await Channel.findOne({ chatId: channelDetails.chatId });
    if (existing) {
      return NextResponse.json(
        { error: "Channel already listed" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        channel: {
          ...channelDetails,
          botStatus: "ready",
        },
      },
      { status: 200 },
    );
  } catch (err: any) {
    if (err.message?.includes("not admin")) {
      return NextResponse.json(
        { error: err.message, botStatus: "not_added" },
        { status: 400 },
      );
    }

    if (err.message?.includes("missing required permissions")) {
      return NextResponse.json(
        { error: err.message, botStatus: "missing_permissions" },
        { status: 400 },
      );
    }

    if (err.message?.includes("chat not found")) {
      return NextResponse.json({ error: "Channel not found" }, { status: 400 });
    }

    return NextResponse.json(
      { error: err.message || "Verification failed" },
      { status: 400 },
    );
  }
}

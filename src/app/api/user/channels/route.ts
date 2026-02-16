// src/app/api/user/channels/route.ts

import { NextResponse } from "next/server";
import { Channel } from "@/models/Channel";
import { connectDB } from "@/lib/mongoose";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    const userId = session?.id ? Number(session.id) : null;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const channels = await Channel.find(
      { ownerId: userId },
      {
        _id: 0,
        chatId: 1,
        title: 1,
        username: 1,
        photo: 1,
        pricing: 1,
        stats: { followers: 1 },
      },
    ).lean();

    return NextResponse.json({ channels });
  } catch (error) {
    console.error("Failed to fetch user channels:", error);
    return NextResponse.json(
      { message: "Failed to fetch channels" },
      { status: 500 },
    );
  }
}

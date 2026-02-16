import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getChannelAdmins, verifyUserIsOwner } from "@/lib/tgMethods";

export async function POST(req: Request) {
  try {
    const { chatId, excludeAdmins } = await req.json();

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

    await verifyUserIsOwner(chatId, Number(session.id));

    const admins = await getChannelAdmins(chatId, excludeAdmins ?? []);

    return NextResponse.json(
      {
        success: true,
        admins,
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
      { error: err.message || "Admins fetch failed" },
      { status: 400 },
    );
  }
}

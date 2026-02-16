// src/app/api/deals/[id]/submit-ad/route.ts

import { Types } from "mongoose";
import { Deal } from "@/models/Deal";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const apiKey = req.headers.get("x-api-key");
    if (apiKey !== process.env.PYTHON_APP_SECRET) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { chatId, messageId } = await req.json();

    if (!chatId || !messageId) {
      return NextResponse.json(
        { message: "chatId and messageId are required" },
        { status: 400 },
      );
    }

    await connectDB();

    const dealId = (await params).id;
    if (!Types.ObjectId.isValid(dealId)) {
      return NextResponse.json({ message: "Invalid deal ID" }, { status: 400 });
    }

    const deal = await Deal.findById(dealId);

    if (!deal) {
      return NextResponse.json({ message: "Deal not found" }, { status: 404 });
    }

    if (
      deal.status !== "awaiting_ad_submission" &&
      deal.status !== "ad_rejected"
    ) {
      return NextResponse.json(
        { message: "Ad can't be submitted at this stage" },
        { status: 400 },
      );
    }

    deal.ad = {
      chatId,
      messageId,
      submittedAt: new Date(),
      rejectedAt: undefined,
    };

    deal.status = "ad_under_review";

    await deal.save();

    return NextResponse.json({ status: deal.status, ad: deal.ad });
  } catch (error) {
    console.error("Submit Ad Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

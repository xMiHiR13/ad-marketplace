// src/app/api/deals/[id]/create-payment/route.ts

import { Types } from "mongoose";
import { Deal } from "@/models/Deal";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getSession } from "@/lib/session";
import { beginCell } from "@ton/core";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();

    if (!session?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.id);

    await connectDB();

    const dealId = (await params).id;
    if (!Types.ObjectId.isValid(dealId)) {
      return NextResponse.json({ message: "Invalid deal ID" }, { status: 400 });
    }

    const deal = await Deal.findById(dealId);
    if (!deal) {
      return NextResponse.json({ message: "Deal not found" }, { status: 404 });
    }

    // Only advertiser can pay
    if (deal.advertiserId !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Must be awaiting payment
    if (deal.status !== "awaiting_payment") {
      return NextResponse.json(
        { message: "Deal not ready for payment" },
        { status: 400 },
      );
    }

    // Prevent double payment
    if (deal.payment?.txHash) {
      return NextResponse.json(
        { message: "Deal already paid" },
        { status: 400 },
      );
    }

    if (!deal.escrowAddress) {
      deal.escrowAddress = process.env.ESCROW_ADDRESS;
      if (!deal.escrowAddress) {
        return NextResponse.json(
          { message: "No escrow address configured" },
          { status: 400 },
        );
      }
      await deal.save();
    }

    // Calculate total price
    const totalPriceTon =
      deal.negotiation?.proposedPrice ?? deal.price * deal.duration;

    if (!totalPriceTon || totalPriceTon <= 0) {
      return NextResponse.json(
        { message: "Invalid deal price" },
        { status: 400 },
      );
    }

    // Convert TON -> nanotons (string required by TonConnect)
    const amountNano = BigInt(Math.floor(totalPriceTon * 1e9)).toString();

    // attach comment payload (optional)
    const comment = `Deal:${deal._id.toString()}`;
    const cell = beginCell()
      .storeUint(0, 32)
      .storeStringTail(comment)
      .endCell();
    const payload = cell.toBoc().toString("base64");

    // 5 minutes validity
    const validUntil = Math.floor(Date.now() / 1000) + 300;

    return NextResponse.json({
      recipient: deal.escrowAddress,
      amount: amountNano,
      payload,
      validUntil,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create payment intent" },
      { status: 500 },
    );
  }
}
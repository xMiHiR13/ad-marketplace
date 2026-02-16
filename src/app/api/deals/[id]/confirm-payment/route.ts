// src/app/api/deals/[id]/confirm-payment/route.ts

import { Types } from "mongoose";
import { Deal } from "@/models/Deal";
import { Address, Cell } from "@ton/core";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getSession } from "@/lib/session";
import { Payment } from "@/models/Payment";

async function fetchTxWithRetry(
  txHash: string,
  maxRetries = 5,
  delayMs = 5000,
) {
  const TON_API_KEY = process.env.TONAPI_KEY;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const res = await fetch(
      `https://tonapi.io/v2/blockchain/transactions/${txHash}`,
      {
        headers: { Authorization: `Bearer ${TON_API_KEY}` },
      },
    );
    const tx = await res.json();

    if (tx.success && tx.utime !== 0) {
      // Transaction is confirmed
      return tx;
    }

    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error("Transaction not confirmed after multiple retries");
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const dealId = (await params).id;

  try {
    // Auth
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.id);

    // Parse request
    const { boc, schedule: scheduleInput } = await req.json();
    if (!boc || typeof boc !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid BOC" },
        { status: 400 },
      );
    }

    // Handle schedule input ──
    let postAt: Date | undefined;
    if (scheduleInput) {
      if (scheduleInput.immediate === true) {
        // Immediate -> post as soon as possible
        postAt = new Date();
      } else if (scheduleInput.postAt) {
        // Specific time
        const parsedDate = new Date(scheduleInput.postAt);
        if (isNaN(parsedDate.getTime())) {
          return NextResponse.json(
            { error: "Invalid postAt date format" },
            { status: 400 },
          );
        }
        postAt = parsedDate;
      }
    }

    if (!postAt) {
      return NextResponse.json(
        {
          error:
            "Schedule is required. Please select immediate or a specific posting time.",
        },
        { status: 400 },
      );
    }

    if (!Types.ObjectId.isValid(dealId)) {
      return NextResponse.json({ message: "Invalid deal ID" }, { status: 400 });
    }

    // Find deal
    await connectDB();
    const deal = await Deal.findById(dealId);
    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    // Authorization and state checks
    if (deal.advertiserId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (deal.payment?.txHash) {
      return NextResponse.json(
        { message: "Already paid", txHash: deal.payment.txHash },
        { status: 200 },
      );
    }

    if (deal.status !== "awaiting_payment") {
      return NextResponse.json(
        { error: "Invalid deal stage" },
        { status: 400 },
      );
    }

    // Compute transaction hash
    const cell = Cell.fromBase64(boc);
    const txHash = cell.hash().toString("hex");

    const existingPayment = await Payment.findOne({ txHash });
    if (existingPayment) {
      return NextResponse.json(
        { message: "This transaction already exists" },
        { status: 200 },
      );
    }

    // Small delay so tx get verified on blockchain
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Fetch and verify transaction (with 5 retries)
    let tx;
    try {
      tx = await fetchTxWithRetry(txHash, 5, 5000); // 5 retries, 5 seconds apart
    } catch (error) {
      return NextResponse.json(
        { message: "Transaction not found on blockchain" },
        { status: 202 },
      );
    }

    // Basic confirmation checks
    if (tx.aborted) {
      return NextResponse.json(
        { error: "Transaction was aborted" },
        { status: 400 },
      );
    }

    if (tx.utime === 0) {
      return NextResponse.json(
        { message: "Transaction not yet confirmed. Retry in 5-10 seconds." },
        { status: 202 },
      );
    }

    // Extract amount and recipient
    const outMsg = tx.out_msgs?.[0];
    if (!outMsg)
      return NextResponse.json(
        { error: "No outgoing message found" },
        { status: 400 },
      );

    const receivedNano = BigInt(outMsg.value ?? 0);
    const expectedNano = BigInt(
      Math.floor(
        (deal.negotiation?.proposedPrice ?? deal.price * deal.duration) * 1e9,
      ),
    );

    if (receivedNano < expectedNano)
      return NextResponse.json(
        { error: "Payment amount too low" },
        { status: 400 },
      );

    const recipientRaw = outMsg.destination?.address;

    // Parse the stored friendly escrow address to raw string
    const escrowAddr = Address.parse(deal.escrowAddress!);
    const escrowRaw = escrowAddr.toRawString();

    if (recipientRaw !== escrowRaw) {
      return NextResponse.json(
        { error: "Incorrect recipient address" },
        { status: 400 },
      );
    }

    // Comment validation
    const comment =
      outMsg.decoded_body?.text || tx.in_msg?.decoded_body?.value?.text || "";
    if (comment && !comment.includes(`Deal:${deal._id.toString()}`)) {
      return NextResponse.json(
        { error: "Invalid transaction comment" },
        { status: 400 },
      );
    }

    let fromFriendly: string | undefined;
    try {
      if (outMsg.source?.address) {
        try {
          const senderAddr = Address.parseRaw(outMsg.source.address); // parses "0:..."
          fromFriendly = senderAddr.toString({
            bounceable: false,
            urlSafe: true,
            testOnly: false,
          });
        } catch (parseErr) {
          console.warn(
            `[confirm-payment] Failed to parse sender address: ${outMsg.source.address}:`,
            parseErr,
          );
        }
      }
      const payment = new Payment({
        userId: userId,
        type: "sent",
        amount: Number(receivedNano) / 1e9,
        from: fromFriendly ?? outMsg.source.address,
        to: deal.escrowAddress!,
        label: `Deal #${dealId} - Payment Sent`,
        date: new Date(tx.utime * 1000),
        txHash: txHash,
      });

      await payment.save();
    } catch (saveErr) {
      console.error(
        `[confirm-payment] Failed to save Payment record for deal ${dealId}:`,
        saveErr,
      );
    }

    // Save confirmed payment
    deal.payment = { senderAddress: fromFriendly ?? outMsg.source.address, txHash, paidAt: new Date() };
    deal.schedule = { postAt };
    deal.status = "scheduled";
    await deal.save();

    return NextResponse.json({
      success: true,
      txHash,
      scheduledPostAt: postAt.toISOString(),
      message: "Payment confirmed and held in escrow",
    });
  } catch (error: unknown) {
    console.error(`[confirm-payment] ${dealId}:`, error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Payment confirmation failed", details: msg },
      { status: 500 },
    );
  }
}

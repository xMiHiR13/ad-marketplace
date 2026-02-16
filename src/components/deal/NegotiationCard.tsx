"use client";

import Image from "next/image";
import TonPrice from "@/components/shared/TonPrice";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/shared/Button";
import { useTonPrice, FALLBACK_TON_USD_RATE } from "@/hooks/useTonPrice";

interface NegotiationCardProps {
  initialPerDayPrice: number; // per day, immutable
  proposedPrice?: number; // total price proposed
  proposedBy?: "advertiser" | "publisher";
  role: "advertiser" | "publisher";
  status: "negotiating" | "price_proposed";
  duration: number;
  durationSet?: boolean;
  onProposePrice: (price: number) => void;
  onAcceptPrice: () => void;
  proposeLoading?: boolean;
  acceptLoading?: boolean;
}

export default function NegotiationCard({
  initialPerDayPrice,
  proposedPrice,
  proposedBy,
  role,
  status,
  duration,
  durationSet = true,
  onProposePrice,
  onAcceptPrice,
  proposeLoading = false,
  acceptLoading = false,
}: NegotiationCardProps) {
  const [newPrice, setNewPrice] = useState<string>("");
  const { data: tonPrice } = useTonPrice();
  const usdRate = tonPrice ?? FALLBACK_TON_USD_RATE;

  const hasPendingProposal = status === "price_proposed" && proposedBy !== role;
  const isWaitingForResponse =
    status === "price_proposed" && proposedBy === role;
  const isPublisherWaiting = role === "publisher" && status === "negotiating";
  const canPropose =
    status === "negotiating" ||
    (status === "price_proposed" && proposedBy !== role);

  const handleProposePrice = () => {
    const price = parseFloat(newPrice);
    if (!isNaN(price) && price > 0) {
      onProposePrice(price);
      setNewPrice("");
    }
  };

  const initialTotalPrice = initialPerDayPrice * duration;
  // Current total: if a price has been proposed, use it; otherwise fall back to initial total
  const currentTotalPrice = proposedPrice ?? initialTotalPrice;
  const priceChanged = proposedPrice && proposedPrice !== initialTotalPrice;
  const otherRoleLabel = role === "advertiser" ? "Publisher" : "Advertiser";

  return (
    <div className="card-surface p-3">
      <div className="flex items-center gap-2 text-xs text-foreground-muted mb-2">
        <i className="ri-discuss-line" />
        <span>Price negotiation</span>
      </div>

      {/* Price per day + Total in one row */}
      <div className="flex items-stretch gap-2 mb-2">
        <div className="flex-1 rounded-xl p-2.5 bg-gradient-to-br from-white/[0.07] to-transparent border border-white/[0.08] flex flex-col justify-center">
          <span className="text-[10px] text-foreground-muted tracking-wide">
            Initial per day price
          </span>
          <div className="mt-1">
            <TonPrice amount={initialPerDayPrice} size="md" />
          </div>
          <p className="text-[10px] text-foreground-subtle mt-0.5">
            ≈ ${Math.round(initialPerDayPrice * usdRate)}
          </p>
        </div>
        <div className="flex-1 rounded-xl p-2.5 bg-gradient-to-br from-primary/[0.06] to-transparent border border-primary/[0.12] flex flex-col justify-center">
          <span className="text-[10px] text-foreground-muted tracking-wide">
            Current total price · {duration} {duration === 1 ? "day" : "days"}
          </span>
          <div className="mt-1 flex items-center gap-1.5">
            <TonPrice amount={currentTotalPrice} size="md" />
            {priceChanged && (
              <span className="text-[10px] text-foreground-subtle line-through flex items-center gap-0.5">
                <Image src={"/ton.svg"} alt="TON" width={12} height={12} />
                {initialTotalPrice}
              </span>
            )}
          </div>
          <div className="text-[10px] text-foreground-subtle mt-0.5">
            ≈ ${Math.round(currentTotalPrice * usdRate)}
          </div>
        </div>
      </div>

      {/* Publisher Waiting State */}
      {isPublisherWaiting && durationSet && (
        <div className="bg-muted/50 border border-white/10 rounded-xl p-3 text-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <i className="ri-time-line text-lg text-primary" />
          </div>
          <p className="text-sm text-foreground">
            Waiting for the advertiser to finalize the price
          </p>
          <p className="text-xs text-foreground-subtle mt-1">
            The deal will proceed once a price is agreed upon.
          </p>
        </div>
      )}

      {/* Pending Proposal from Other Party */}
      {hasPendingProposal && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-2.5 mb-3">
          <p className="text-sm text-foreground flex items-center flex-wrap gap-1">
            <i className="ri-notification-3-line text-primary" />
            <span>{otherRoleLabel} proposed</span>
            <span className="inline-flex items-center gap-1 font-semibold text-primary">
              <Image src={"/ton.svg"} alt="TON" width={16} height={16} />
              {proposedPrice}
            </span>
            <span className="text-foreground-muted">
              (≈ ${Math.round((proposedPrice || 0) * usdRate)})
            </span>
          </p>
        </div>
      )}

      {/* Waiting for Response State */}
      {isWaitingForResponse && (
        <div className="bg-muted/50 border border-white/10 rounded-xl p-2.5 mb-3">
          <p className="text-sm text-foreground-muted flex items-center flex-wrap gap-1">
            <i className="ri-time-line text-foreground-subtle" />
            <span>You proposed</span>
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <Image src={"/ton.svg"} alt="TON" width={16} height={16} />
              {proposedPrice}
            </span>
            <span className="text-foreground-subtle">
              (≈ ${Math.round((proposedPrice || 0) * usdRate)})
            </span>
            <span>— waiting for {otherRoleLabel.toLowerCase()} to accept</span>
          </p>
        </div>
      )}

      {/* Price Input - Only for advertiser, price is total */}
      {canPropose && (
        <div className="mb-3">
          <label className="text-xs text-foreground-muted mb-1.5 block">
            Propose total price (TON)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder={currentTotalPrice.toString()}
                className="h-10 pr-10 bg-[hsl(var(--card-bg))] border-white/10 text-foreground placeholder:text-foreground-muted/50 rounded focus:border-primary focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none transition-colors duration-200"
                min="1"
                step="1"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Image src={"/ton.svg"} alt="TON" width={16} height={16} />
              </span>
            </div>
            <Button
              variant="secondary"
              onClick={handleProposePrice}
              loading={proposeLoading}
              disabled={!newPrice || parseFloat(newPrice) <= 0 || acceptLoading}
              className="w-[100px] h-10 !min-h-[40px] flex-shrink-0 !rounded"
            >
              <i className="ri-send-plane-line mr-1" />
              Propose
            </Button>
          </div>
          {newPrice &&
            !isNaN(parseFloat(newPrice)) &&
            parseFloat(newPrice) > 0 && (
              <p className="text-xs text-foreground-subtle mt-1">
                ≈ ${Math.round(parseFloat(newPrice) * usdRate)} for {duration}{" "}
                {duration === 1 ? "day" : "days"}
              </p>
            )}
        </div>
      )}

      {/* Action Buttons */}
      {!isPublisherWaiting && (
        <div className="space-y-2">
          {hasPendingProposal && (
            <Button
              variant="primary"
              fullWidth
              onClick={onAcceptPrice}
              loading={acceptLoading}
              disabled={proposeLoading}
              className="primary-glow"
            >
              <i className="ri-check-line mr-2" />
              Accept Price
            </Button>
          )}

          {status === "negotiating" &&
            !isWaitingForResponse &&
            role === "advertiser" && (
              <Button
                variant="primary"
                fullWidth
                onClick={onAcceptPrice}
                loading={acceptLoading}
                disabled={proposeLoading}
                className="primary-glow"
              >
                <i className="ri-check-line mr-2" />
                Accept Price
              </Button>
            )}
        </div>
      )}
    </div>
  );
}

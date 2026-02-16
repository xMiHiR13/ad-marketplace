"use client";

import Link from "next/link";
import Image from "next/image";
import ActivitySection from "./Activity";
import DealStatusSection from "./DealStatus";
import NegotiationSection from "./Negotiation";
import DealSummarySection from "./DealSummary";
import ActionButtonsSection from "./ActionButtons";
import NotFoundCard from "@/components/shared/NotFoundCard";

import {
  DealStatus,
  DEAL_STATUS_LABELS,
  DEAL_STATUS_TYPE,
  isDealTerminal,
  isDealNegotiating,
  Deal,
  DealRole,
} from "@/types/deal";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DealTimeline } from "./DealTimeline";
import { useQuery } from "@tanstack/react-query";
import { formatDateISO, truncateTxHash } from "@/lib/formatters";
import { DealDetailSkeleton } from "@/components/skeleton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { buildChannelUrl, buildCampaignUrl } from "@/lib/navigation";
import { TonAddressPicker } from "@/components/channel/TonAddressPicker";
import { useTelegram } from "@/contexts/TelegramContext";

// Statuses before the payment stage — publisher can still update payout address
const PRE_PAYMENT_STATUSES: DealStatus[] = [
  "negotiating",
  "price_proposed",
  "awaiting_ad_submission",
  "ad_under_review",
  "ad_rejected",
];

interface DealDetailProps {
  dealId: string;
}

export default function DealDetail({ dealId }: DealDetailProps) {
  const router = useRouter();
  const { telegram } = useTelegram();

  const { data, isLoading } = useQuery({
    queryKey: ["deals", dealId],
    queryFn: async (): Promise<{
      deal: Deal;
      role: DealRole;
    }> => {
      const res = await fetch(`/api/deals/${dealId}`);
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || data.message || "Failed to fetch deal");
      return data;
    },
  });

  // Payout address state — must be before early returns (hooks rule)
  const [payoutAddress, setPayoutAddress] = useState<string>(
    data?.deal.channel.payoutAddress ?? "",
  );

  useDocumentTitle("Deal Details");

  if (isLoading) return <DealDetailSkeleton isFullscreen={telegram?.isFullscreen ?? false} />;
  if (!data?.deal) return <NotFoundCard type="deal" />;

  const deal = data.deal;
  const rawRole = data.role;

  const isTerminal = isDealTerminal(deal.status);
  const isNegotiating = isDealNegotiating(deal.status);

  // Payout address — publisher owner can edit before payment stage
  const isOwnerPublisher = rawRole === "publisher"; // not manager
  const isPrePayment = PRE_PAYMENT_STATUSES.includes(deal.status);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className={`sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border ${telegram?.isFullscreen ? "pt-20" : ""}`}>
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="Go back"
          >
            <i className="ri-arrow-left-line text-lg" aria-hidden="true" />
          </button>
          <h1 className="text-lg font-semibold text-foreground truncate flex-1">
            Deal Details
          </h1>
          {isTerminal && (
            <span className="flex items-center gap-1 text-xs text-foreground-muted">
              <i className="ri-lock-line" aria-hidden="true" />
              Closed
            </span>
          )}
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        {/* Channel Info */}
        <section className="card-surface p-4" aria-label="Channel information">
          <Link
            href={buildChannelUrl(deal.channel.chatId)}
            className="flex items-center justify-between mb-3 w-full hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <i className="ri-broadcast-line" aria-hidden="true" />
              <span>Channel</span>
            </div>
            <i
              className="ri-arrow-right-s-line text-foreground-muted"
              aria-hidden="true"
            />
          </Link>
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 relative">
              {deal.channel.photo ? (
                <Image
                  src={deal.channel.photo}
                  alt="Channel Photo"
                  fill
                  sizes="56px"
                  className="object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                  <i
                    className="ri-telegram-fill text-primary text-xl"
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-foreground truncate">
                {deal.channel.title || `Channel #${deal.channel.chatId}`}
              </h2>
              {deal.channel.username && (
                <p className="text-xs text-foreground-muted mt-0.5">
                  @{deal.channel.username}
                </p>
              )}
              {deal.channel.link && (
                <Link
                  href={deal.channel.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary mt-1 hover:underline"
                >
                  <i className="ri-external-link-line" aria-hidden="true" />
                  Open in Telegram
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Campaign Info */}
        {deal.campaign && (
          <section
            className="card-surface p-4"
            aria-label="Campaign information"
          >
            <Link
              href={buildCampaignUrl(deal.campaign!.id)}
              className="flex items-center justify-between mb-3 w-full hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-2 text-xs text-foreground-muted">
                <i className="ri-megaphone-line" aria-hidden="true" />
                <span>Campaign</span>
              </div>
              <i
                className="ri-arrow-right-s-line text-foreground-muted"
                aria-hidden="true"
              />
            </Link>
            <h3 className="font-semibold text-foreground">
              {deal.campaign.title}
            </h3>
            <p className="text-sm text-foreground-muted mt-1 line-clamp-2">
              {deal.campaign.description}
            </p>
          </section>
        )}

        {/* Deal Progress Timeline */}
        <section className="card-surface p-4" aria-label="Deal progress">
          <h3 className="text-sm font-medium text-foreground mb-4">
            Deal Progress
          </h3>
          <DealTimeline currentStatus={deal.status} />
        </section>

        {isNegotiating && <NegotiationSection deal={deal} rawRole={rawRole} />}

        {/* Deal Status */}
        <section className="card-surface p-4" aria-label="Deal status">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-foreground-muted">
              Current Status
            </span>
            <StatusBadge status={DEAL_STATUS_TYPE[deal.status]} size="sm">
              {DEAL_STATUS_LABELS[deal.status]}
            </StatusBadge>
          </div>
          <DealStatusSection deal={deal} rawRole={rawRole} />
        </section>

        {/* Deal Summary */}
        <section className="space-y-2" aria-label="Deal summary">
          <DealSummarySection
            deal={deal}
            rawRole={rawRole}
            isNegotiating={isNegotiating}
          />
        </section>

        {/* Payout Address — owner-publisher only; editable before payment, readonly after */}
        {isOwnerPublisher &&
          (isPrePayment ? (
            <TonAddressPicker
              value={payoutAddress}
              onChange={async (address: string) => setPayoutAddress(address)}
              mode="editable"
              label="Payout Address"
            />
          ) : (
            <TonAddressPicker
              value={deal.channel.payoutAddress}
              mode="readonly"
              label="Payout Address"
            />
          ))}

        {/* Schedule Info */}
        {deal.schedule && (deal.schedule.postAt || deal.schedule.post) && (
          <section className="card-surface p-4" aria-label="Schedule">
            <h3 className="text-sm font-medium text-foreground mb-3">
              Schedule
            </h3>
            <div className="space-y-2">
              {deal.schedule.postAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground-muted">
                    <i className="ri-calendar-line mr-2" aria-hidden="true" />
                    Scheduled for
                  </span>
                  <span className="text-foreground">
                    {formatDateISO(deal.schedule.postAt)}
                  </span>
                </div>
              )}
              {deal.schedule.post && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground-muted">
                    <i className="ri-check-line mr-2" aria-hidden="true" />
                    Posted at
                  </span>
                  <span className="text-[hsl(var(--status-success))]">
                    {formatDateISO(deal.schedule.post.postedAt)}
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Payment Info */}
        {deal.payment && (
          <section
            className="card-surface p-4"
            aria-label="Payment information"
          >
            <h3 className="text-sm font-medium text-foreground mb-3">
              Payment
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground-muted">
                  <i className="ri-wallet-3-line mr-2" aria-hidden="true" />
                  Transaction
                </span>
                <span className="text-foreground font-mono text-xs overflow-hidden">
                  {truncateTxHash(deal.payment.txHash)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground-muted">
                  <i className="ri-time-line mr-2" aria-hidden="true" />
                  Paid at
                </span>
                <span className="text-[hsl(var(--status-success))]">
                  {formatDateISO(deal.payment.paidAt)}
                </span>
              </div>
              {deal.payment.refundedAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground-muted">
                    <i className="ri-refund-2-line mr-2" aria-hidden="true" />
                    Refunded at
                  </span>
                  <span className="text-[hsl(var(--status-error))]">
                    {formatDateISO(deal.payment.refundedAt)}
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Activity Log */}
        <section className="card-surface p-4" aria-label="Activity log">
          <h3 className="text-sm font-medium text-foreground mb-4">Activity</h3>
          <ActivitySection deal={deal} />
        </section>

        {/* Bottom CTA Buttons */}
        <div className="space-y-2">
          {!isTerminal && (
            <ActionButtonsSection deal={deal} rawRole={rawRole} />
          )}
        </div>
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import TonPrice from "@/components/shared/TonPrice";

import {
  DEAL_STATUS_LABELS,
  DEAL_STATUS_TYPE,
  AD_TYPE_LABELS,
  DealCardType,
} from "@/types/deal";
import { buildDealUrl } from "@/lib/navigation";
import { StatusBadge } from "@/components/shared/StatusBadge";

// Ad type badge colors - consistent with marketplace
const AD_TYPE_COLORS: Record<string, string> = {
  post: "bg-primary/10 text-primary",
  story: "bg-violet-500/10 text-violet-400",
  postWithForward: "bg-status-success/10 text-status-success",
  other: "bg-foreground-muted/10 text-foreground-muted",
};

const formatRelativeDate = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return "Just now";
};

interface DealCardProps {
  deal: DealCardType;
}

export function DealCard({ deal }: DealCardProps) {
  return (
    <Link
      href={buildDealUrl(deal.id)}
      className="block w-full card-surface-hover p-3 text-left animate-fade-in"
    >
      <div className="flex items-start gap-2">
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 relative">
          {deal.channel.photo ? (
            <Image
              src={deal.channel.photo}
              alt="Channel Photo"
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary/20 flex items-center justify-center">
              <i className="ri-telegram-fill text-primary" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground truncate flex items-center gap-1">
                <i
                  className="ri-telegram-fill text-xs text-primary flex-shrink-0"
                  aria-hidden="true"
                />
                {deal.channel.title}
              </h3>
              {deal.campaign && (
                <p className="text-[10px] text-foreground-muted truncate flex items-center gap-1">
                  <i
                    className="ri-megaphone-line text-[10px] flex-shrink-0"
                    aria-hidden="true"
                  />
                  {deal.campaign.title}
                </p>
              )}
            </div>
            <StatusBadge
              status={DEAL_STATUS_TYPE[deal.status]}
              size="sm"
              className="flex-shrink-0"
            >
              {DEAL_STATUS_LABELS[deal.status]}
            </StatusBadge>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5 text-[10px]">
              <span
                className={`${AD_TYPE_COLORS[deal.adType]} px-1.5 py-0.5 rounded text-[9px] font-medium`}
              >
                {AD_TYPE_LABELS[deal.adType]}
              </span>
              <span className="text-foreground-subtle">•</span>
              <span className="text-foreground-subtle font-medium capitalize">
                {deal.role}
              </span>
              <span className="text-foreground-subtle">•</span>
              <span className="text-foreground-subtle">
                {formatRelativeDate(new Date(deal.createdAt).getTime())}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <TonPrice amount={deal.price} size="sm" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
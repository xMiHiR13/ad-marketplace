"use client";

import TonPrice from "@/components/shared/TonPrice";

import { useRouter } from "next/navigation";
import { formatNumber } from "@/lib/formatters";
import { buildChannelUrl } from "@/lib/navigation";
import { Button } from "@/components/shared/Button";
import { useTonPrice, FALLBACK_TON_USD_RATE } from "@/hooks/useTonPrice";
import {
  PRICING_LABELS,
  ChannelPricing,
  ChannelCardType,
} from "@/types/channel";
import Image from "next/image";

interface ChannelCardProps {
  data: ChannelCardType;
}

// Badge color variants for pricing
const PRICING_COLORS: Record<keyof ChannelPricing, string> = {
  post: "bg-primary/10 border-primary/20 text-primary",
  story: "bg-violet-500/10 border-violet-500/20 text-violet-400",
  postWithForward:
    "bg-status-success/10 border-status-success/20 text-status-success",
};

export function ChannelCard({ data: channel }: ChannelCardProps) {
  const router = useRouter();
  const { data: tonPrice } = useTonPrice();
  const usdRate = tonPrice ?? FALLBACK_TON_USD_RATE;

  const notificationPercent = Math.round(
    (channel.stats.enabledNotifications.part /
      channel.stats.enabledNotifications.total) *
      100,
  );

  const pricingKeys = Object.keys(channel.pricing) as Array<
    keyof typeof channel.pricing
  >;

  return (
    <div className="card-surface-hover p-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10 relative">
          {channel.photo ? (
            <Image
              src={channel.photo}
              alt={channel.title}
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <i className="ri-telegram-fill text-2xl text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-foreground truncate">
              {channel.title}
            </h3>
          </div>
          {channel.username && (
            <span className="inline-flex items-center gap-1 text-xs text-foreground-muted mt-0.5">
              @{channel.username}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
          <div className="flex items-center justify-center gap-1">
            <i className="ri-user-3-line text-xs text-primary" />
            <span className="text-sm font-bold text-foreground">
              {formatNumber(channel.stats.followers.current)}
            </span>
          </div>
          <div className="text-[10px] text-foreground-muted mt-0.5">
            Subscribers
          </div>
        </div>
        {(channel.pricing.post || channel.pricing.postWithForward) && (
          <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
            <div className="flex items-center justify-center gap-1">
              <i className="ri-eye-line text-xs text-cyan-400" />
              <span className="text-sm font-bold text-foreground">
                {formatNumber(channel.stats.viewsPerPost.current)}
              </span>
            </div>
            <div className="text-[10px] text-foreground-muted mt-0.5">
              Avg. Views
            </div>
          </div>
        )}
        {channel.pricing.story && (
          <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
            <div className="flex items-center justify-center gap-1">
              <i className="ri-flashlight-line text-xs text-violet-400" />
              <span className="text-sm font-bold text-foreground">
                {formatNumber(channel.stats.viewsPerStory.current)}
              </span>
            </div>
            <div className="text-[10px] text-foreground-muted mt-0.5">
              Story Views
            </div>
          </div>
        )}
        {((!channel.pricing.post && !channel.pricing.postWithForward) ||
          !channel.pricing.story) && (
          <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
            <div className="flex items-center justify-center gap-1">
              <i className="ri-notification-3-line text-xs text-status-success" />
              <span className="text-sm font-bold text-foreground">
                {notificationPercent}%
              </span>
            </div>
            <div className="text-[10px] text-foreground-muted mt-0.5">
              Notif. On
            </div>
          </div>
        )}
      </div>

      {/* Dynamic pricing badges with TON prices */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {pricingKeys.map((key) => {
          const priceTon = Math.round(channel.pricing[key]! / usdRate);
          return (
            <span
              key={key}
              className={`inline-flex items-center gap-1 px-2 py-1 border rounded-lg text-[10px] font-medium ${PRICING_COLORS[key]}`}
            >
              <TonPrice amount={priceTon} size="sm" /> · {PRICING_LABELS[key]}
            </span>
          );
        })}
      </div>

      <Button
        variant="secondary"
        size="md"
        fullWidth
        className="mt-4"
        onClick={() => router.push(buildChannelUrl(channel.chatId))}
      >
        <i className="ri-arrow-right-up-line mr-2" />
        View Channel
      </Button>
    </div>
  );
}
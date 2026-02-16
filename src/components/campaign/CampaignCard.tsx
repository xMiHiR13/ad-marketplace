"use client";

import { Button } from "@/components/shared/Button";
import {
  Campaign,
  CATEGORY_COLORS,
  AD_TYPE_LABELS,
  AD_TYPE_COLORS,
  CampaignLanguage,
  getLanguageColor,
} from "@/types/campaign";
import { buildCampaignUrl } from "@/lib/navigation";
import { useTonPrice, FALLBACK_TON_USD_RATE } from "@/hooks/useTonPrice";
import { formatNumber } from "@/lib/formatters";
import { useRouter } from "next/navigation";
import TonPrice from "@/components/shared/TonPrice";

type CampaignCardProps = Campaign;

export function CampaignCard({
  id,
  title,
  description,
  budgetMin,
  budgetMax,
  category,
  requirements,
}: CampaignCardProps) {
  const router = useRouter();
  const { data: tonPrice } = useTonPrice();
  const usdRate = tonPrice ?? FALLBACK_TON_USD_RATE;

  // Convert USD budget to TON
  const budgetMinTon = Math.round(budgetMin / usdRate);
  const budgetMaxTon = Math.round(budgetMax / usdRate);

  // Determine which stats to show based on ad types
  const showPostViews =
    requirements.adTypes.includes("post") ||
    requirements.adTypes.includes("postWithForward");
  const showStoryViews = requirements.adTypes.includes("story");

  // Build stats array dynamically
  const stats = [
    {
      icon: "ri-user-3-line",
      iconColor: "text-primary",
      value: requirements.minSubscribers
        ? `${formatNumber(requirements.minSubscribers)}+`
        : "Any",
      label: "Subscribers",
      show: true,
    },
    {
      icon: "ri-eye-line",
      iconColor: "text-cyan-400",
      value: requirements.minPostViews
        ? `${formatNumber(requirements.minPostViews)}+`
        : "Any",
      label: "Post Views",
      show: showPostViews,
    },
    {
      icon: "ri-flashlight-line",
      iconColor: "text-violet-400",
      value: requirements.minStoryViews
        ? `${formatNumber(requirements.minStoryViews)}+`
        : "Any",
      label: "Story Views",
      show: showStoryViews,
    },
  ].filter((stat) => stat.show);

  return (
    <div className="card-surface-hover p-4 animate-fade-in">
      {/* Header with title and category */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-foreground line-clamp-1 flex-1">
          {title}
        </h3>
        {category && (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-medium border flex-shrink-0 ${CATEGORY_COLORS[category]}`}
          >
            {category}
          </span>
        )}
      </div>

      <p className="text-sm text-foreground-muted line-clamp-2 mb-4">
        {description}
      </p>

      {/* Stats Grid - Dynamic based on ad types */}
      <div
        className={`grid gap-2 ${stats.length === 3 ? "grid-cols-3" : stats.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white/5 rounded-xl p-3 text-center border border-white/5"
          >
            <div className="flex items-center justify-center gap-1">
              <i className={`${stat.icon} text-xs ${stat.iconColor}`} />
              <span className="text-sm font-bold text-foreground">
                {stat.value}
              </span>
            </div>
            <div className="text-[10px] text-foreground-muted mt-0.5">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Ad Types + Languages + Budget Row */}
      <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {requirements.adTypes.map((adType) => (
              <span
                key={adType}
                className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-medium border ${AD_TYPE_COLORS[adType]}`}
              >
                {AD_TYPE_LABELS[adType]}
              </span>
            ))}
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-bold flex-shrink-0">
            <TonPrice amount={budgetMinTon} size="sm" />
            <span className="text-foreground-muted">-</span>
            <TonPrice amount={budgetMaxTon} size="sm" />
          </span>
        </div>
        {requirements.languages && requirements.languages.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {requirements.languages.map((lang) => (
              <span
                key={lang}
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${getLanguageColor(lang as CampaignLanguage)}`}
              >
                {lang}
              </span>
            ))}
          </div>
        )}
      </div>

      <Button
        variant="secondary"
        size="md"
        fullWidth
        className="mt-4"
        onClick={() => router.push(buildCampaignUrl(id))}
      >
        <i className="ri-arrow-right-up-line mr-2" />
        View Campaign
      </Button>
    </div>
  );
}

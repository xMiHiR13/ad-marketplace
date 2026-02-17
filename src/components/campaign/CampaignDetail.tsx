"use client";

import TonPrice from "@/components/shared/TonPrice";
import NotFoundCard from "@/components/shared/NotFoundCard";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AdType } from "@/types/deal";
import { useState, useMemo } from "react";
import { Campaign } from "@/types/campaign";
import { useRouter } from "next/navigation";
import { formatNumber } from "@/lib/formatters";
import { toast } from "@/components/shared/Toast";
import { Button } from "@/components/shared/Button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { CampaignDetailSkeleton } from "@/components/skeleton";
import { useTonPrice, FALLBACK_TON_USD_RATE } from "@/hooks/useTonPrice";
import { ChannelSelectSheet } from "@/components/channel/ChannelSelectSheet";
import {
  CATEGORY_COLORS,
  AD_TYPE_LABELS,
  AD_TYPE_COLORS,
  CampaignLanguage,
  getLanguageColor,
} from "@/types/campaign";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { buildDealUrl } from "@/lib/navigation";
import { useTelegram } from "@/contexts/TelegramContext";

interface CampaignDetailProps {
  campaignId?: string;
}

interface RequestDealInput {
  campaignId: string;
  channelId: number;
  adType: AdType;
}

// API fetcher
const fetchCampaign = async (
  campaignId: string,
): Promise<{ campaign: Campaign; isOwner: boolean }> => {
  const res = await fetch(`/api/campaigns/${campaignId}`);
  if (!res.ok) throw new Error("Failed to fetch campaign");
  return res.json();
};

export default function CampaignDetail({ campaignId }: CampaignDetailProps) {
  const router = useRouter();
  const { telegram } = useTelegram();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showChannelSelect, setShowChannelSelect] = useState(false);

  const { data: tonPrice } = useTonPrice();
  const usdRate = tonPrice ?? FALLBACK_TON_USD_RATE;

  const { data, isLoading, error } = useQuery({
    queryKey: ["campaigns", campaignId],
    queryFn: () => fetchCampaign(campaignId!),
    enabled: !!campaignId,
  });

  const campaign = data?.campaign;
  const isOwner = data?.isOwner;

  const deleteCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.error || data.message || "Failed to delete campaign",
        );
      return campaignId;
    },
    onSuccess: (deletedId) => {
      // Remove campaign detail cache
      queryClient.removeQueries({ queryKey: ["campaigns", deletedId] });

      // Update campaign list cache
      queryClient.setQueryData<Campaign[] | undefined>(["campaigns"], (old) => {
        if (!old) return [];
        return old.filter((c) => c.id !== deletedId);
      });

      // Update profile cache
      queryClient.setQueryData(["profile"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          campaigns: old.campaigns.filter((c: any) => c.id !== deletedId),
        };
      });

      toast.success("Campaign deleted");
      router.push("/?tab=campaigns");
    },
    onError: (err: any) =>
      toast.error(err.error || err.message || "Failed to delete campaign"),
  });

  const requestDealMutation = useMutation<any, any, RequestDealInput>({
    mutationFn: async ({ campaignId, channelId, adType }) => {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, channelId, adType }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.error || data.message || "Failed to initialize deal",
        );
      return;
    },
    onSuccess: (data) => {
      toast.success("Deal requested");
      if (data.id) {
        router.push(buildDealUrl(data.id));
      }
    },
    onError: (err: any) =>
      toast.error(err.error || err.message || "Failed to initialize deal"),
  });

  useDocumentTitle(
    campaign?.title ? `${campaign.title} Campaign` : "Campaign Details",
  );

  // Determine which stats to show based on ad types — must be before early returns (hooks rule)
  const showPostViews =
    campaign?.requirements.adTypes.includes("post") ||
    campaign?.requirements.adTypes.includes("postWithForward");
  const showStoryViews = campaign?.requirements.adTypes.includes("story");

  const stats = useMemo(() => {
    if (!campaign) return [];
    return [
      {
        icon: "ri-user-3-line",
        iconColor: "text-primary",
        value: campaign.requirements.minSubscribers
          ? `${formatNumber(campaign.requirements.minSubscribers)}+`
          : "Any",
        label: "Subscribers",
        show: true,
      },
      {
        icon: "ri-eye-line",
        iconColor: "text-cyan-400",
        value: campaign.requirements.minPostViews
          ? `${formatNumber(campaign.requirements.minPostViews)}+`
          : "Any",
        label: "Post Views",
        show: showPostViews,
      },
      {
        icon: "ri-flashlight-line",
        iconColor: "text-violet-400",
        value: campaign.requirements.minStoryViews
          ? `${formatNumber(campaign.requirements.minStoryViews)}+`
          : "Any",
        label: "Story Views",
        show: showStoryViews,
      },
    ].filter((stat) => stat.show);
  }, [campaign, showPostViews, showStoryViews]);

  if (isLoading) {
    return (
      <CampaignDetailSkeleton isFullscreen={telegram?.isFullscreen ?? false} />
    );
  }

  if (error || !campaign) {
    return <NotFoundCard type="campaign" />;
  }

  const handleApply = () => {
    setShowChannelSelect(true);
  };

  const handleChannelConfirm = (channelId: number, adType: AdType) => {
    if (!campaign) return;
    requestDealMutation.mutate({
      campaignId: campaign.id,
      channelId,
      adType,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header
        className={`sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border ${telegram?.isFullscreen ? "pt-20" : ""}`}
      >
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="Go back"
          >
            <i className="ri-arrow-left-line text-lg" aria-hidden="true" />
          </button>
          <h1 className="text-lg font-semibold text-foreground truncate flex-1">
            Campaign Details
          </h1>
          {isOwner && (
            <AlertDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <button
                  className="w-10 h-10 rounded-xl bg-status-error/10 border border-status-error/20 flex items-center justify-center hover:bg-status-error/20 transition-colors"
                  aria-label="Delete campaign"
                >
                  <i
                    className="ri-delete-bin-line text-lg text-status-error"
                    aria-hidden="true"
                  />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-white/10 max-w-[90%] rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">
                    Delete Campaign
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-foreground-muted">
                    Are you sure you want to delete &quot;{campaign.title}
                    &quot;? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="grid grid-cols-2 gap-2">
                  <AlertDialogCancel
                    disabled={deleteCampaignMutation.isPending}
                    className="w-full bg-white/5 border-white/10 text-foreground hover:bg-white/10 h-11 m-0"
                  >
                    Cancel
                  </AlertDialogCancel>
                  <button
                    onClick={() => deleteCampaignMutation.mutate(campaign.id)}
                    disabled={deleteCampaignMutation.isPending}
                    className="w-full inline-flex items-center justify-center bg-status-error hover:bg-status-error/80 text-white h-11 rounded-md text-sm font-medium disabled:opacity-50"
                  >
                    {deleteCampaignMutation.isPending ? (
                      <i
                        className="ri-loader-4-line animate-spin text-base"
                        aria-hidden="true"
                      />
                    ) : (
                      "Delete"
                    )}
                  </button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        {/* Campaign Header */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h2 className="text-xl font-bold text-foreground leading-tight flex-1">
              {campaign.title}
            </h2>
            {campaign.category && (
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border flex-shrink-0 ${CATEGORY_COLORS[campaign.category]}`}
              >
                {campaign.category}
              </span>
            )}
          </div>
        </div>

        {/* About Campaign - right below title */}
        <p className="text-sm text-foreground-muted leading-relaxed">
          {campaign.description}
        </p>

        {/* Budget Card */}
        <section className="card-surface p-4" aria-label="Budget range">
          <div className="flex items-center gap-2 text-foreground-muted mb-1">
            <i className="ri-wallet-3-line text-primary" aria-hidden="true" />
            <span className="text-xs">Budget Range</span>
          </div>
          <div className="flex items-center gap-2">
            <TonPrice
              amount={Math.round(campaign.budgetMin / usdRate)}
              size="lg"
            />
            <span className="text-foreground-muted">-</span>
            <TonPrice
              amount={Math.round(campaign.budgetMax / usdRate)}
              size="lg"
            />
          </div>
          <p className="text-xs text-foreground-muted mt-1">
            ≈ ${campaign.budgetMin} - ${campaign.budgetMax}
          </p>
        </section>

        {/* Requirements Stats */}
        <section aria-label="Channel requirements">
          <h3 className="text-xs font-semibold text-foreground-muted mb-2 uppercase tracking-wider">
            Channel Requirements
          </h3>
          <div
            className={`grid gap-2 ${stats.length === 3 ? "grid-cols-3" : stats.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white/5 rounded-xl p-3 text-center border border-white/5"
              >
                <div className="flex items-center justify-center gap-1">
                  <i
                    className={`${stat.icon} text-xs ${stat.iconColor}`}
                    aria-hidden="true"
                  />
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
        </section>

        {/* Ad Types */}
        <section aria-label="Accepted ad types">
          <h3 className="text-xs font-semibold text-foreground-muted mb-2 uppercase tracking-wider">
            Ad Types Accepted
          </h3>
          <div className="flex flex-wrap gap-2">
            {campaign.requirements.adTypes.map((adType) => (
              <span
                key={adType}
                className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium border ${AD_TYPE_COLORS[adType]}`}
              >
                {AD_TYPE_LABELS[adType]}
              </span>
            ))}
          </div>
        </section>

        {/* Languages */}
        {campaign.requirements.languages &&
          campaign.requirements.languages.length > 0 && (
            <section aria-label="Target languages">
              <h3 className="text-xs font-semibold text-foreground-muted mb-2 uppercase tracking-wider">
                Target Languages
              </h3>
              <div className="flex flex-wrap gap-2">
                {campaign.requirements.languages.map((lang) => (
                  <span
                    key={lang}
                    className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium border ${getLanguageColor(lang as CampaignLanguage)}`}
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </section>
          )}
      </main>

      {/* Sticky CTA */}
      <div className="sticky-bottom">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={requestDealMutation.isPending}
          onClick={handleApply}
          className="flex items-center justify-center h-12 w-full primary-glow disabled:opacity-50"
        >
          {requestDealMutation.isPending ? (
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <i className="ri-send-plane-line mr-2" aria-hidden="true" />
              Apply to Campaign
            </>
          )}
        </Button>
      </div>

      {/* Channel Select Sheet */}
      <ChannelSelectSheet
        isOpen={showChannelSelect}
        onClose={() => setShowChannelSelect(false)}
        onConfirm={handleChannelConfirm}
        campaignTitle={campaign.title}
      />
    </div>
  );
}

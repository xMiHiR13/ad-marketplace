"use client";

import Link from "next/link";
import Image from "next/image";
import TonPrice from "@/components/shared/TonPrice";
import NotFoundCard from "@/components/shared/NotFoundCard";

import {
  PRICING_LABELS,
  ChannelPricing,
  METRIC_COLORS,
  Channel,
} from "@/types/channel";
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
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { buildDealUrl } from "@/lib/navigation";
import { toast } from "@/components/shared/Toast";
import { Button } from "@/components/shared/Button";
import { StatItem } from "@/components/shared/StatItem";
import { useTelegram } from "@/contexts/TelegramContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ChannelDetailSkeleton } from "@/components/skeleton";
import { LanguageChart } from "@/components/channel/LanguageChart";
import { ChannelManagers } from "@/components/channel/ChannelManagers";
import { TonAddressPicker } from "@/components/channel/TonAddressPicker";
import { useTonPrice, FALLBACK_TON_USD_RATE } from "@/hooks/useTonPrice";
import { ViewsByHoursChart } from "@/components/channel/ViewsByHoursChart";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatNumber, formatDateISO, truncateAddressLong } from "@/lib/formatters";
import { PremiumSubscribersCard } from "@/components/channel/PremiumSubscribersCard";

// Pricing badge colors
const PRICING_COLORS: Record<keyof ChannelPricing, string> = {
  post: "bg-primary/10 border-primary text-primary",
  story: "bg-violet-500/10 border-violet-500 text-violet-400",
  postWithForward:
    "bg-status-success/10 border-status-success text-status-success",
};

interface ChannelDetailProps {
  channelId?: string;
}

interface ChannelResponse {
  channel: Channel;
  isOwner: boolean;
}

export default function ChannelDetail({ channelId }: ChannelDetailProps) {
  const router = useRouter();
  const { telegram } = useTelegram();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState<
    keyof ChannelPricing | null
  >(null);

  const [pricingKeys, setPricingKeys] = useState<(keyof ChannelPricing)[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["channel", channelId],
    queryFn: async () => {
      const chatId = Number(channelId);
      const res = await fetch(`/api/channels/${chatId}`);

      if (!res.ok) {
        throw new Error("Failed to fetch channel");
      }

      const data: ChannelResponse = await res.json();
      return data;
    },
    enabled: !!channelId,
  });

  const deleteChannelMutation = useMutation({
    mutationFn: async (chatId: number) => {
      const res = await fetch(`/api/channels/${chatId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message || "Failed to delete channel");
      }

      return chatId;
    },

    onSuccess: (deletedChatId) => {
      // Remove channel detail cache
      queryClient.removeQueries({
        queryKey: ["channels", deletedChatId],
      });

      // Update channel list cache
      queryClient.setQueryData(["channels"], (old: Channel[] | undefined) => {
        if (!old) return old;
        return old.filter((c) => c.chatId !== deletedChatId);
      });
      
      // Update profile cache
      queryClient.setQueryData(["profile"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          channels: old.channels.filter((c: any) => c.chatId !== deletedChatId),
        };
      });

      toast.success("Channel removed", {
        description: `"${channel ? channel.title : "Your channel"}" has been delisted from the marketplace.`,
      });

      setDeleteDialogOpen(false);
      router.push("/?tab=channels");
    },

    onError: (err: any) => {
      console.error(err);
      toast.error(err.message || "Something went wrong while deleting");
    },
  });

  const requestAdMutation = useMutation({
    mutationFn: async ({
      channelId,
      adType,
    }: {
      channelId: number;
      adType: AdType;
    }) => {
      const res = await fetch(`/api/deals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId, adType }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || data.message || "Failed to request ad");
      return data;
    },
    onSuccess: (data) => {
      toast.success("Ad placement requested", {
        description: `Your request ${channel ? "for ".concat(channel.title) : ""} has been submitted.`,
      });
      router.push(buildDealUrl(data.id));
    },
    onError: (err: any) =>
      toast.error(err.error || err.message || "Failed to request ad"),
  });

  const channel = data?.channel;
  const isOwner = data?.isOwner;

  const [managerIds, setManagerIds] = useState<number[]>([]);
  const [isUpdatingManagers, setIsUpdatingManagers] = useState(false);

  // Use cached TON price — must be called before any early returns
  const { data: tonPrice } = useTonPrice();
  const usdRate = tonPrice ?? FALLBACK_TON_USD_RATE;

  useDocumentTitle("Channel Details");

  useEffect(() => {
    if (channel) {
      setManagerIds(channel.managerIds);
      setPricingKeys(Object.keys(channel.pricing) as (keyof ChannelPricing)[]);
    }
  }, [channel]);

  useEffect(() => {
    if (selectedIndex >= 0) {
      setSelectedPricing(pricingKeys[selectedIndex]);
    }
  }, [selectedIndex]);

  if (isLoading) {
    return <ChannelDetailSkeleton isFullscreen={telegram?.isFullscreen ?? false} />;
  }

  if (error || !channel) {
    return <NotFoundCard type="channel" />;
  }

  const notificationPercent = Math.round(
    (channel.stats.enabledNotifications.part /
      channel.stats.enabledNotifications.total) *
      100,
  );

  const handleManagersChange = async (newIds: number[]) => {
    if (!channel) return;

    setIsUpdatingManagers(true);

    try {
      const res = await fetch(`/api/channels/${channel.chatId}/managers`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managerIds: newIds }),
      });

      if (!res.ok) {
        throw new Error("Failed to update managers");
      }

      setManagerIds(newIds);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update managers");
    }

    setIsUpdatingManagers(false);
  };

  const handlePayoutChange = async (address: string) => {
    if (!channel) return;

    try {
      const res = await fetch(`/api/channels/${channel.chatId}/payout`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutAddress: address }),
      });

      if (!res.ok) {
        throw new Error("Failed to update payout address");
      }

      queryClient.setQueryData(["channel", channelId], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          channel: {
            ...old.channel,
            payoutAddress: address,
          },
        };
      });

      toast.success("Payout address updated", {
        description: `Funds will be sent to ${truncateAddressLong(address)}.`,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update payout address");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!pricingKeys.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < pricingKeys.length - 1 ? prev + 1 : 0,
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : pricingKeys.length - 1,
      );
    }

    if (e.key === "Enter" && selectedIndex >= 0) {
      setSelectedPricing(pricingKeys[selectedIndex]);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className={`sticky top-0 z-40 ${telegram?.isFullscreen ? "pt-20" : ""}`}>
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
        <div className="relative px-4 py-3 flex items-center gap-3 border-b border-white/5">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="Go back"
          >
            <i className="ri-arrow-left-line text-lg" aria-hidden="true" />
          </button>
          <h1 className="text-lg font-semibold text-foreground truncate flex-1">
            Channel Details
          </h1>
          {isOwner && (
            <AlertDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <button
                  className="w-10 h-10 rounded-xl bg-status-error/10 border border-status-error/20 flex items-center justify-center hover:bg-status-error/20 transition-colors"
                  aria-label="Delete channel"
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
                    Delete Channel
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-foreground-muted">
                    Are you sure you want to remove &quot;{channel.title}&quot;
                    from the marketplace? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="grid grid-cols-2 gap-2">
                  <AlertDialogCancel
                    disabled={deleteChannelMutation.isPending}
                    className="w-full bg-white/5 border-white/10 text-foreground hover:bg-white/10 h-11 m-0"
                  >
                    Cancel
                  </AlertDialogCancel>
                  <button
                    onClick={() => deleteChannelMutation.mutate(channel.chatId)}
                    disabled={deleteChannelMutation.isPending}
                    className="w-full inline-flex items-center justify-center bg-status-error hover:bg-status-error/80 text-white h-11 rounded-md text-sm font-medium disabled:opacity-50"
                  >
                    {deleteChannelMutation.isPending ? (
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
        {/* Channel Header */}
        <section className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mx-auto mb-3 flex items-center justify-center border-2 border-white/10 overflow-hidden relative">
            {channel.photo ? (
              <Image
                src={channel.photo}
                alt={`${channel.title} avatar`}
                fill
                className="object-cover"
                sizes="80px"
                priority
              />
            ) : (
              <i
                className="ri-telegram-fill text-3xl text-primary"
                aria-hidden="true"
              />
            )}
          </div>
          <h2 className="text-xl font-bold text-foreground">{channel.title}</h2>
          {channel.username && (
            <p className="text-xs text-foreground-muted mt-0.5">
              @{channel.username}
            </p>
          )}
          <Link
            href={channel.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
          >
            <i className="ri-external-link-line" aria-hidden="true" />
            Open in Telegram
          </Link>
        </section>

        {/* Core Stats */}
        <section aria-label="Channel overview">
          <h3 className="text-xs font-semibold text-foreground-muted mb-2 uppercase tracking-wider">
            Overview
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <StatItem
              label="Subscribers"
              current={channel.stats.followers.current}
              previous={channel.stats.followers.previous}
              icon="ri-user-3-line"
              iconColor={METRIC_COLORS.subscribers}
            />
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="flex items-center gap-1.5 mb-1">
                <i
                  className={`ri-notification-3-line text-xs ${METRIC_COLORS.notifications} flex-shrink-0`}
                  aria-hidden="true"
                />
                <span className="text-[10px] text-foreground-muted uppercase tracking-wider">
                  Notif. On
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold text-foreground">
                  {notificationPercent}%
                </span>
                <span className="text-xs text-foreground-muted">
                  ≈{formatNumber(channel.stats.enabledNotifications.part)}
                </span>
              </div>
            </div>
            <div className="col-span-2">
              <PremiumSubscribersCard
                part={channel.stats.premiumSubscribers.part}
                total={channel.stats.premiumSubscribers.total}
              />
            </div>
          </div>
        </section>

        {/* Post Metrics */}
        <section aria-label="Post metrics">
          <h3 className="text-xs font-semibold text-foreground-muted mb-2 uppercase tracking-wider">
            Post Metrics
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <StatItem
              label="Views"
              current={channel.stats.viewsPerPost.current}
              previous={channel.stats.viewsPerPost.previous}
              icon="ri-eye-line"
              iconColor={METRIC_COLORS.views}
            />
            <StatItem
              label="Shares"
              current={channel.stats.sharesPerPost.current}
              previous={channel.stats.sharesPerPost.previous}
              icon="ri-share-forward-line"
              iconColor={METRIC_COLORS.shares}
            />
            <StatItem
              label="Reactions"
              current={channel.stats.reactionsPerPost.current}
              previous={channel.stats.reactionsPerPost.previous}
              icon="ri-heart-line"
              iconColor={METRIC_COLORS.reactions}
            />
          </div>
        </section>

        {/* Story Metrics */}
        <section aria-label="Story metrics">
          <h3 className="text-xs font-semibold text-foreground-muted mb-2 uppercase tracking-wider">
            Story Metrics
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <StatItem
              label="Views"
              current={channel.stats.viewsPerStory.current}
              previous={channel.stats.viewsPerStory.previous}
              icon="ri-eye-line"
              iconColor={METRIC_COLORS.views}
            />
            <StatItem
              label="Shares"
              current={channel.stats.sharesPerStory.current}
              previous={channel.stats.sharesPerStory.previous}
              icon="ri-share-forward-line"
              iconColor={METRIC_COLORS.shares}
            />
            <StatItem
              label="Reactions"
              current={channel.stats.reactionsPerStory.current}
              previous={channel.stats.reactionsPerStory.previous}
              icon="ri-heart-line"
              iconColor={METRIC_COLORS.reactions}
            />
          </div>
        </section>

        {/* Views by Hours Chart */}
        <ViewsByHoursChart
          data={channel.stats.topHours}
          currentDateRange={channel.stats.topHoursDateRanges.current}
          previousDateRange={channel.stats.topHoursDateRanges.previous}
        />

        {/* Language Distribution */}
        <LanguageChart
          data={channel.stats.languages}
          totalSubscribers={channel.stats.followers.current}
        />

        {/* Managers Section - Owner only */}
        {isOwner && (
          <ChannelManagers
            channelId={channel.chatId}
            managerIds={managerIds}
            onManagersChange={handleManagersChange}
            isUpdatingManagers={isUpdatingManagers}
          />
        )}

        {/* Payout Address - Owner only */}
        {isOwner && (
          <TonAddressPicker
            value={channel.payoutAddress}
            onChange={handlePayoutChange}
            label="Payout Address"
          />
        )}

        {/* Pricing Selection */}
        <section className="card-surface p-4" aria-label="Ad type pricing">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-foreground">
              Select Ad Type
            </h3>
            <span className="text-[10px] text-foreground-muted flex items-center gap-1">
              <i className="ri-time-line text-xs" aria-hidden="true" />
              Per day price
            </span>
          </div>
          <div className="space-y-2">
            {pricingKeys.map((key, index) => {
              const isSelected = selectedPricing === key;
              const colorClass = PRICING_COLORS[key];
              const tonPriceVal = channel.pricing[key]!;
              return (
                <button
                  key={key}
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                  onClick={() => {
                    setSelectedPricing(key);
                    setSelectedIndex(index);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isSelected
                      ? colorClass
                      : "bg-white/5 border-white/10 hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-current bg-current"
                          : "border-white/30"
                      }`}
                    >
                      {isSelected && (
                        <i
                          className="ri-check-line text-xs text-background"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <span
                      className={`text-sm ${isSelected ? "" : "text-foreground"}`}
                    >
                      {PRICING_LABELS[key]}
                    </span>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <TonPrice amount={tonPriceVal} size="sm" />
                    <span className="text-xs text-foreground-muted">
                      ≈ ${Math.round(tonPriceVal * usdRate)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Price Info - when ad type selected */}
        {selectedPricing && (
          <div className="bg-white/5 rounded-xl p-3 border border-white/10 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground-muted flex items-center gap-1">
                <i className="ri-time-line text-xs" aria-hidden="true" />
                Per day price
              </span>
              <TonPrice amount={channel.pricing[selectedPricing]!} size="md" />
            </div>
            <p className="text-[10px] text-foreground-subtle mt-1">
              Post duration and total price will be finalized during the
              negotiation phase
            </p>
          </div>
        )}

        {/* Last Updated */}
        <div className="flex items-center justify-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
          <i
            className="ri-refresh-line text-sm text-primary"
            aria-hidden="true"
          />
          <span className="text-xs text-primary font-medium">
            Stats updated: {formatDateISO(channel.stats.fetchedAt)}
          </span>
        </div>

        {/* CTA Button */}
        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={requestAdMutation.isPending}
            disabled={!selectedPricing}
            onClick={() => {
              if (!selectedPricing) return;
              requestAdMutation.mutate({
                channelId: channel.chatId,
                adType: selectedPricing,
              });
            }}
            className="primary-glow"
          >
            <i className="ri-send-plane-fill mr-2" aria-hidden="true" />
            Request Ad Placement
          </Button>
        </div>
      </main>
    </div>
  );
}

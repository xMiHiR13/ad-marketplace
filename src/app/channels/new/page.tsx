"use client";

import Link from "next/link";
import Image from "next/image";

import { z } from "zod";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/formatters";
import { toast } from "@/components/shared/Toast";
import { AD_TYPE_COLORS } from "@/types/campaign";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StatItem } from "@/components/shared/StatItem";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { LanguageChart } from "@/components/channel/LanguageChart";
import { ChannelManagers } from "@/components/channel/ChannelManagers";
import { TonAddressPicker } from "@/components/channel/TonAddressPicker";
import { useTonPrice, FALLBACK_TON_USD_RATE } from "@/hooks/useTonPrice";
import { ViewsByHoursChart } from "@/components/channel/ViewsByHoursChart";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { ChannelPricing, ChannelStats, METRIC_COLORS } from "@/types/channel";
import { PremiumSubscribersCard } from "@/components/channel/PremiumSubscribersCard";
import { useTelegram } from "@/contexts/TelegramContext";
import { useQueryClient } from "@tanstack/react-query";
import { buildChannelUrl } from "@/lib/navigation";

type BotStatus = "not_added" | "missing_permissions" | "ready";
type FetchStatus = "idle" | "loading" | "success" | "error";
type StatsStatus = "idle" | "loading" | "success" | "error";

interface FetchedChannel {
  chatId: number;
  title: string;
  username?: string | null;
  photo?: string | null;
  link: string;
  botStatus: BotStatus;
}

const pricingSchema = z
  .object({
    post: z.coerce.number().min(1, "Min 1 TON").optional(),
    story: z.coerce.number().min(1, "Min 1 TON").optional(),
    postWithForward: z.coerce.number().min(1, "Min 1 TON").optional(),
  })
  .refine((data) => data.post || data.story || data.postWithForward, {
    message: "Select at least one ad type",
    path: ["post"],
  });

type PricingFormData = z.infer<typeof pricingSchema>;

const adTypeOptions: {
  value: keyof ChannelPricing;
  label: string;
  icon: string;
}[] = [
  { value: "post", label: "Post", icon: "ri-file-text-line" },
  { value: "story", label: "Story", icon: "ri-slideshow-line" },
  {
    value: "postWithForward",
    label: "Post + Forward",
    icon: "ri-share-forward-line",
  },
];

const REQUIRED_PERMISSIONS = [
  { key: "post_messages", label: "Post Messages", icon: "ri-send-plane-line" },
  { key: "post_stories", label: "Post Stories", icon: "ri-slideshow-line" },
  { key: "invite_users", label: "Invite Users via Link", icon: "ri-link" },
  { key: "add_admins", label: "Add New Admins", icon: "ri-user-add-line" },
];

const AD_TYPE_INPUT_BORDERS: Record<keyof ChannelPricing, string> = {
  post: "border-primary",
  story: "border-violet-500",
  postWithForward: "border-status-success",
};

const inputStyles =
  "h-10 bg-[hsl(var(--card-bg))] border-white/10 text-foreground placeholder:text-foreground-muted/50 rounded focus:border-primary focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none transition-colors duration-200";

function PricePreview({
  control,
  name,
  isEnabled,
  formatUsd,
}: {
  control: any;
  name: keyof PricingFormData;
  isEnabled: boolean;
  formatUsd: (value: number | undefined) => string;
}) {
  const value = useWatch({
    control,
    name,
  });

  if (!isEnabled || !value) return <span>&nbsp;</span>;

  return (
    <span className="text-[10px] text-foreground-muted leading-none">
      {formatUsd(value)}/day
    </span>
  );
}

export default function ListChannel() {
  const router = useRouter();
  const { telegram } = useTelegram();
  const queryClient = useQueryClient();

  const channelInputRef = React.useRef<HTMLInputElement>(null);
  const priceInputRefs = React.useRef<Record<string, HTMLInputElement | null>>(
    {},
  );

  // Channel fetch state
  const [channelInput, setChannelInput] = useState("");
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>("idle");
  const [fetchedChannel, setFetchedChannel] = useState<FetchedChannel | null>(
    null,
  );
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Stats fetch state
  const [statsStatus, setStatsStatus] = useState<StatsStatus>("idle");
  const [channelStats, setChannelStats] = useState<ChannelStats | null>(null);
  const [statsError, setStatsError] = useState<{
    message: string;
    canRetry: boolean;
  } | null>(null);

  // Ad types state
  const [enabledAdTypes, setEnabledAdTypes] = useState<
    (keyof ChannelPricing)[]
  >([]);
  const isValidatingRef = React.useRef(false);

  // Managers state (for new channel listing, owner is always current user)
  const [managerIds, setManagerIds] = useState<number[]>([]);
  const [isUpdatingManagers, setIsUpdatingManagers] = useState(false);

  // Payout address state
  const [payoutAddress, setPayoutAddress] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useDocumentTitle("List Channel");

  const { data: tonPrice, isLoading: isPriceLoading } = useTonPrice();
  const usdRate = tonPrice ?? FALLBACK_TON_USD_RATE;

  const form = useForm<PricingFormData>({
    resolver: zodResolver(pricingSchema) as any,
    defaultValues: {
      post: undefined,
      story: undefined,
      postWithForward: undefined,
    },
  });

  const formatUsd = (tonAmount: number | undefined): string => {
    if (!tonAmount) return "";
    if (isPriceLoading) return "...";
    return `≈ $${(tonAmount * usdRate).toFixed(2)}`;
  };

  const handleFetchChannel = async () => {
    if (!channelInput.trim()) return;

    let chatId = channelInput.trim();

    if (chatId.includes("https://t.me/+")) {
      toast.error("Private invite link not allowed", {
        description: "Enter channel ID instead.",
      });
      return;
    }

    if (/^-?\d+$/.test(chatId)) {
      if (chatId[0] !== "-") {
        chatId = `-100${chatId}`;
      }
      if (chatId.length < 10) {
        toast.error("Invalid channel id", {
          description: "Enter a valid channel id.",
        });
        return;
      }
    } else {
      if (chatId[0] === "@") {
        chatId = chatId.slice(1);
      } else if (chatId.includes("t.me/")) {
        chatId = chatId.split("t.me/", 2)[1];
      }
      if (!/^[A-Za-z]/.test(chatId)) {
        toast.error("Invalid channel", {
          description: "Enter a valid channel link or @username.",
        });
        return;
      }
      chatId = `@${chatId}`;
    }

    try {
      setFetchStatus("loading");
      setFetchError(null);
      setFetchedChannel(null);
      setChannelStats(null);
      setStatsStatus("idle");

      const res = await fetch("/api/telegram/fetch-channel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId: chatId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFetchStatus("error");
        setFetchError(data.error || "Channel verification failed");
        setFetchedChannel({
          chatId: 0,
          title: "",
          username: null,
          photo: null,
          link: "",
          botStatus: data.botStatus || "not_added",
        });
        toast.error(data.error);
        return;
      }

      setFetchedChannel(data.channel);
      setFetchStatus("success");

      // Automatically fetch stats after verification
      await fetchChannelStats(data.channel.chatId, data.channel.link);
    } catch (err: any) {
      setFetchStatus("error");
      setFetchError("Network error. Please try again.");
      toast.error("Network error");
      return;
    }
  };

  const fetchChannelStats = async (chatId: number, link: string) => {
    setStatsStatus("loading");
    setStatsError(null);

    try {
      const res = await fetch("/api/telegram/fetch-stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId, link }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatsStatus("error");
        setStatsError({
          message: data.error || "Channel stats fetch failed",
          canRetry:
            !data.error ||
            !data.error.includes("This channel does not have statistics")
              ? true
              : false,
        });
        toast.error(data.error);
        return;
      }

      setStatsStatus("success");
      setChannelStats(data.stats);
    } catch (err: any) {
      setStatsStatus("error");
      setStatsError({
        message: "Network error. Please try again.",
        canRetry: true,
      });
      toast.error("Network error");
    }
  };

  const toggleAdType = (type: keyof ChannelPricing) => {
    if (enabledAdTypes.includes(type)) {
      setEnabledAdTypes(enabledAdTypes.filter((t) => t !== type));
      form.setValue(type, undefined);
    } else {
      setEnabledAdTypes([...enabledAdTypes, type]);
    }
  };

  const handleManagersChange = async (newIds: number[]) => {
    setIsUpdatingManagers(true);
    setManagerIds(newIds);
    setIsUpdatingManagers(false);
  };

  const handleFormSubmit = () => {
    // Validate payout address
    if (!payoutAddress) {
      toast.error("Payout address required", {
        description: "Connect your TON wallet to set a payout address.",
      });
      return;
    }

    if (enabledAdTypes.length === 0) {
      toast.error("Set pricing", {
        description: "Select at least one ad type and set its price.",
      });
      return;
    }

    // Check if any enabled ad type is missing a valid price
    const missingPriceTypes = enabledAdTypes.filter((type) => {
      const value = form.getValues(type);
      return !value || value < 1;
    });

    if (missingPriceTypes.length > 0) {
      const labels = missingPriceTypes.map(
        (t) => adTypeOptions.find((o) => o.value === t)?.label ?? t,
      );
      toast.warning("Price required", {
        description: `Set a price for ${labels.join(", ")} or unselect ${missingPriceTypes.length > 1 ? "them" : "it"}.`,
      });
      return;
    }

    form.handleSubmit(onSubmit)();
  };

  const onSubmit = async (pricingData: PricingFormData) => {
    if (!fetchedChannel || !channelStats) return;

    try {
      setIsSubmitting(true);

      const res = await fetch("/api/channels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: fetchedChannel.chatId,
          title: fetchedChannel.title,
          username: fetchedChannel.username,
          photo: fetchedChannel.photo,
          link: fetchedChannel.link,
          pricing: pricingData,
          managerIds,
          payoutAddress,
          stats: channelStats,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to list channel");
      }

      // Invalidate profile cache data
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      toast.success("Channel listed successfully");
      router.push(buildChannelUrl(data.chatId));
    } catch (err: any) {
      toast.error("Failed to list channel", {
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed =
    fetchedChannel?.botStatus === "ready" && statsStatus === "success";
  const notificationPercent = channelStats
    ? Math.round(
        (channelStats.enabledNotifications.part /
          channelStats.enabledNotifications.total) *
          100,
      )
    : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className={`sticky top-0 z-40 ${telegram?.isFullscreen ? "pt-20" : ""}`}>
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
        <div className="relative px-4 py-3 border-b border-white/5 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-card-bg hover:bg-card-hover transition-colors"
            aria-label="Go back"
          >
            <i
              className="ri-arrow-left-line text-lg text-foreground"
              aria-hidden="true"
            />
          </button>
          <h1 className="text-xl font-bold text-foreground">List Channel</h1>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        {/* Add Bot Helper */}
        <Link
          href={`https://t.me/${process.env.NEXT_PUBLIC_BOT_USERNAME}?startchannel=true`}
          target="_blank"
          rel="noopener noreferrer"
          className="block card-surface p-4 w-full text-left hover:bg-card-hover transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <i className="ri-telegram-fill text-lg text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground">
                Add our bot to your channel first
              </p>
              <p className="text-[10px] text-foreground-muted">
                Required to fetch channel details
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <i className="ri-arrow-right-up-line text-primary" />
            </div>
          </div>
        </Link>

        {/* Channel Input */}
        <div className="card-surface p-4 space-y-4">
          <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
            Channel Input
          </h2>

          <div className="space-y-2">
            <label className="text-xs text-foreground-muted flex items-center gap-1">
              Channel ID, Username, or Link
              <span className="text-status-error text-xs">*</span>
            </label>
            <div className="flex gap-2">
              <Input
                ref={channelInputRef}
                placeholder="e.g., @channelname or t.me/channelname"
                className={`${inputStyles} flex-1`}
                value={channelInput}
                onChange={(e) => setChannelInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleFetchChannel();
                  }
                }}
                disabled={
                  fetchStatus === "loading" ||
                  (fetchedChannel !== null &&
                    fetchedChannel.botStatus === "ready")
                }
              />
              {fetchedChannel && fetchedChannel.botStatus === "ready" ? (
                <button
                  type="button"
                  onClick={() => {
                    setFetchedChannel(null);
                    setChannelInput("");
                    setFetchStatus("idle");
                    setChannelStats(null);
                    setStatsStatus("idle");
                    setEnabledAdTypes([]);
                    form.reset();
                    setTimeout(() => channelInputRef.current?.focus(), 0);
                  }}
                  className="w-10 h-10 rounded bg-status-error/10 border border-status-error/20 text-status-error flex items-center justify-center hover:bg-status-error/20 transition-colors"
                >
                  <i className="ri-delete-bin-line text-lg" />
                </button>
              ) : (
                <button
                  onClick={handleFetchChannel}
                  disabled={!channelInput.trim() || fetchStatus === "loading"}
                  className="w-10 h-10 rounded bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {fetchStatus === "loading" ? (
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <i className="ri-search-line text-lg" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Fetch Error */}
          {fetchStatus === "error" && fetchError && (
            <div className="flex items-center p-2 rounded-lg bg-status-error/10 border border-status-error/20 flex items-start gap-2">
              <i className="ri-error-warning-line text-status-error mt-0.5" />
              <p className="text-xs text-status-error">{fetchError}</p>
            </div>
          )}
        </div>

        {/* Channel Fetching Skeleton */}
        {fetchStatus === "loading" && (
          <div className="card-surface p-4 space-y-4">
            <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
              Channel
            </h2>
            <div className="flex items-center gap-3">
              <Skeleton className="w-14 h-14 rounded-xl" />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/3 rounded" />
              </div>
              <Skeleton className="w-10 h-10 rounded-xl" />
            </div>
          </div>
        )}

        {/* Channel Preview - Show when fetched */}
        {fetchedChannel && fetchedChannel.botStatus === "ready" && (
          <div className="card-surface p-4 space-y-4">
            <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
              Channel
            </h2>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden border border-white/10 relative">
                {fetchedChannel.photo ? (
                  <Image
                    src={fetchedChannel.photo}
                    alt={fetchedChannel.title}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <i className="ri-telegram-fill text-2xl text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-foreground truncate">
                  {fetchedChannel.title}
                </h3>
                {fetchedChannel.username && (
                  <p className="text-xs text-foreground-muted">
                    @{fetchedChannel.username}
                  </p>
                )}
              </div>
              {fetchedChannel.botStatus !== "ready" ? (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-status-error/10 border border-status-error/20">
                  <i className="ri-error-warning-line text-status-error text-xs" />
                  <span className="text-[10px] text-status-error font-medium">
                    Setup
                  </span>
                </div>
              ) : (
                <Link
                  href={fetchedChannel.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <i className="ri-external-link-line text-primary" />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Bot Status - Show when channel is fetched but bot is not ready */}
        {fetchedChannel && fetchedChannel.botStatus !== "ready" && (
          <div className="card-surface p-4 space-y-4">
            <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
              Bot Setup Required
            </h2>

            {/* Required Permissions */}
            <div className="space-y-2">
              <p className="text-xs text-foreground-muted">
                Required Admin Permissions:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {REQUIRED_PERMISSIONS.map((perm) => (
                  <div
                    key={perm.key}
                    className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5"
                  >
                    <i className={`${perm.icon} text-primary`} />
                    <span className="text-xs text-foreground">
                      {perm.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Bot Button */}
            <Link
              href={`https://t.me/${process.env.NEXT_PUBLIC_BOT_USERNAME}?startchannel=true`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <i className="ri-robot-line" />
              Add Bot to Channel
            </Link>

            <p className="text-[10px] text-foreground-muted text-center">
              After adding the bot, click the search button again to verify
            </p>
          </div>
        )}

        {/* Channel Stats - Show when bot is ready */}
        {fetchedChannel && fetchedChannel.botStatus === "ready" && (
          <>
            {/* Stats Loading */}
            {statsStatus === "loading" && (
              <div className="card-surface p-4 space-y-4">
                <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                  Channel Statistics
                </h2>
                <div className="flex items-center gap-2 text-xs text-foreground-muted">
                  <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Fetching channel statistics...
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-16 rounded-xl" />
                  <Skeleton className="h-16 rounded-xl" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              </div>
            )}

            {/* Stats Error */}
            {statsStatus === "error" && statsError && (
              <div className="card-surface p-4 space-y-3">
                <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                  Channel Statistics
                </h2>
                <div className="p-3 rounded-lg bg-status-error/10 border border-status-error/20 space-y-3">
                  <div className="flex items-start gap-2">
                    <i className="ri-error-warning-line text-status-error mt-0.5" />
                    <p className="flex-1 text-xs text-status-error break-words">
                      {statsError.message}
                    </p>
                  </div>
                  {statsError.canRetry && (
                    <button
                      onClick={() =>
                        fetchChannelStats(
                          fetchedChannel.chatId,
                          fetchedChannel.link,
                        )
                      }
                      className="w-full py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-foreground font-medium hover:bg-white/10 transition-colors"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Stats Success */}
            {statsStatus === "success" && channelStats && (
              <>
                {/* Overview */}
                <div className="card-surface p-4 space-y-3">
                  <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                    Overview
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <StatItem
                      label="Subscribers"
                      current={channelStats.followers.current}
                      previous={channelStats.followers.previous}
                      icon="ri-user-3-line"
                      iconColor={METRIC_COLORS.subscribers}
                    />
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <i
                          className={`ri-notification-3-line text-xs ${METRIC_COLORS.notifications} flex-shrink-0`}
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
                          ≈
                          {formatNumber(channelStats.enabledNotifications.part)}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <PremiumSubscribersCard
                        part={channelStats.premiumSubscribers.part}
                        total={channelStats.premiumSubscribers.total}
                      />
                    </div>
                  </div>
                </div>

                {/* Post Metrics */}
                <div className="card-surface p-4 space-y-3">
                  <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                    Post Metrics
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <StatItem
                      label="Views"
                      current={channelStats.viewsPerPost.current}
                      previous={channelStats.viewsPerPost.previous}
                      icon="ri-eye-line"
                      iconColor={METRIC_COLORS.views}
                    />
                    <StatItem
                      label="Shares"
                      current={channelStats.sharesPerPost.current}
                      previous={channelStats.sharesPerPost.previous}
                      icon="ri-share-forward-line"
                      iconColor={METRIC_COLORS.shares}
                    />
                    <StatItem
                      label="Reactions"
                      current={channelStats.reactionsPerPost.current}
                      previous={channelStats.reactionsPerPost.previous}
                      icon="ri-heart-line"
                      iconColor={METRIC_COLORS.reactions}
                    />
                  </div>
                </div>

                {/* Story Metrics */}
                <div className="card-surface p-4 space-y-3">
                  <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                    Story Metrics
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <StatItem
                      label="Views"
                      current={channelStats.viewsPerStory.current}
                      previous={channelStats.viewsPerStory.previous}
                      icon="ri-eye-line"
                      iconColor={METRIC_COLORS.views}
                    />
                    <StatItem
                      label="Shares"
                      current={channelStats.sharesPerStory.current}
                      previous={channelStats.sharesPerStory.previous}
                      icon="ri-share-forward-line"
                      iconColor={METRIC_COLORS.shares}
                    />
                    <StatItem
                      label="Reactions"
                      current={channelStats.reactionsPerStory.current}
                      previous={channelStats.reactionsPerStory.previous}
                      icon="ri-heart-line"
                      iconColor={METRIC_COLORS.reactions}
                    />
                  </div>
                </div>
                {/* Views by Hours Chart */}
                <ViewsByHoursChart
                  data={channelStats.topHours}
                  currentDateRange={channelStats.topHoursDateRanges.current}
                  previousDateRange={channelStats.topHoursDateRanges.previous}
                />

                {/* Language Distribution */}
                <LanguageChart
                  data={channelStats.languages}
                  totalSubscribers={channelStats.followers.current}
                />

                {/* Managers Section - Owner is always the current user when listing */}
                {fetchedChannel && (
                  <ChannelManagers
                    channelId={fetchedChannel.chatId}
                    managerIds={managerIds}
                    onManagersChange={handleManagersChange}
                    isUpdatingManagers={isUpdatingManagers}
                  />
                )}
              </>
            )}
          </>
        )}

        {/* Payout Address - Required before listing */}
        {canProceed && (
          <TonAddressPicker
            value={payoutAddress}
            onChange={async (address: string) => setPayoutAddress(address)}
            required
            label="Payout Address"
          />
        )}

        {/* Pricing Section - Only show when stats are verified */}
        {canProceed && (
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleFormSubmit();
              }}
              className="space-y-4"
            >
              {/* Ad Types & Pricing */}
              <div className="card-surface p-4 space-y-4">
                <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider flex items-center gap-1">
                  Ad Types & Pricing
                  <span className="text-status-error text-xs">*</span>
                </h2>
                <p className="text-[10px] text-foreground-muted">
                  Select ad types and set prices{" "}
                  <span className="text-foreground font-medium">per day</span>
                </p>

                <div className="space-y-1">
                  {adTypeOptions.map((option) => {
                    const isEnabled = enabledAdTypes.includes(option.value);
                    return (
                      <div key={option.value}>
                        {/* Row: Ad Type + Input */}
                        <div className="flex items-center gap-2">
                          {/* Ad Type Toggle - 50% width */}
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => toggleAdType(option.value)}
                            className={`flex items-center justify-center gap-2 px-3 h-10 w-1/2 rounded transition-all border ${
                              isEnabled
                                ? AD_TYPE_COLORS[option.value]
                                : "bg-[hsl(var(--card-bg))] border-white/10 hover:border-white/20 text-foreground-muted"
                            }`}
                          >
                            <i
                              className={`${option.icon} text-base shrink-0`}
                            />
                            <span className="text-xs font-medium whitespace-nowrap">
                              {option.label}
                            </span>
                          </button>

                          {/* Price Input - 50% width */}
                          <div
                            className={`flex items-center gap-2 w-1/2 transition-all duration-200 ${
                              isEnabled ? "opacity-100" : "opacity-30"
                            }`}
                          >
                            <FormField
                              control={form.control}
                              name={option.value}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input
                                      {...field}
                                      ref={(el) => {
                                        priceInputRefs.current[option.value] =
                                          el;
                                      }}
                                      type="number"
                                      min={1}
                                      placeholder="0"
                                      className={`w-full h-10 bg-[hsl(var(--card-bg))] text-foreground text-sm text-right rounded focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none transition-colors duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                                        isEnabled
                                          ? AD_TYPE_INPUT_BORDERS[option.value]
                                          : "border-white/10"
                                      }`}
                                      value={field.value ?? ""}
                                      onFocus={() => {
                                        if (
                                          !enabledAdTypes.includes(option.value)
                                        ) {
                                          setEnabledAdTypes([
                                            ...enabledAdTypes,
                                            option.value,
                                          ]);
                                        }
                                      }}
                                      onBlur={(e) => {
                                        field.onBlur();
                                        // Skip auto-deselect during validation focus
                                        if (isValidatingRef.current) return;
                                        const value = e.target.value;
                                        if (!value || parseFloat(value) < 1) {
                                          setEnabledAdTypes(
                                            enabledAdTypes.filter(
                                              (t) => t !== option.value,
                                            ),
                                          );
                                          form.setValue(
                                            option.value,
                                            undefined,
                                          );
                                        }
                                      }}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <Image
                              src={"/ton.svg"}
                              alt="TON"
                              width={20}
                              height={20}
                              className="flex-shrink-0"
                            />
                          </div>
                        </div>

                        {/* USD Price - Below, aligned right */}
                        <div className="h-4 flex items-start justify-end pr-7 mt-0.5">
                          <PricePreview
                            control={form.control}
                            name={option.value}
                            isEnabled={isEnabled}
                            formatUsd={formatUsd}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              {(() => {
                const hasValidPricing = enabledAdTypes.some((type) => {
                  const value = form.getValues(type);
                  return value && value >= 1;
                });
                return (
                  <button
                    type="submit"
                    disabled={!hasValidPricing || isSubmitting}
                    className="flex items-center justify-center w-full h-12 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "List Channel"
                    )}
                  </button>
                );
              })()}
            </form>
          </Form>
        )}
      </main>
    </div>
  );
}

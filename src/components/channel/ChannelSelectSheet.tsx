"use client";

import Image from "next/image";
import TonPrice from "@/components/shared/TonPrice";

import { useState } from "react";
import { AdType } from "@/types/deal";
import { formatNumber } from "@/lib/formatters";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/shared/Button";
import { BottomSheet } from "@/components/layout/BottomSheet";
import { useTonPrice, FALLBACK_TON_USD_RATE } from "@/hooks/useTonPrice";
import { Channel, ChannelPricing, PRICING_LABELS } from "@/types/channel";

interface ChannelSelectSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (channelId: number, adType: AdType) => void;
  campaignTitle: string;
}

type UserChannel = Pick<
  Channel,
  "chatId" | "title" | "username" | "photo" | "pricing" | "stats"
>;

const fetchUserChannels = async () => {
  const res = await fetch("/api/user/channels");
  if (!res.ok) throw new Error("Failed to fetch channels");
  const data: {
    channels: UserChannel[];
  } = await res.json();
  return data.channels;
};

export function ChannelSelectSheet({
  isOpen,
  onClose,
  onConfirm,
  campaignTitle,
}: ChannelSelectSheetProps) {
  const [selectedChannel, setSelectedChannel] = useState<UserChannel | null>(
    null,
  );
  const [adTypeKeys, setAdTypeKeys] = useState<(keyof ChannelPricing)[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: tonPrice } = useTonPrice();
  const usdRate = tonPrice ?? FALLBACK_TON_USD_RATE;

  const { data: ownedChannels = [], isLoading } = useQuery({
    queryKey: ["userChannels"],
    queryFn: fetchUserChannels,
  });

  const handleConfirm = () => {
    if (!selectedChannel || selectedIndex < 0) return;

    const adType = adTypeKeys[selectedIndex];

    setIsSubmitting(true);

    // Call the parent mutation handler
    onConfirm(selectedChannel.chatId, adType);

    // Reset local state after calling parent
    setIsSubmitting(false);
    handleClose();
  };

  const handleClose = () => {
    setSelectedChannel(null);
    setAdTypeKeys([]);
    setSelectedIndex(-1);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (!adTypeKeys.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < adTypeKeys.length - 1 ? prev + 1 : 0));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : adTypeKeys.length - 1));
    }

    if (e.key === "Enter") {
      setSelectedIndex(index);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      title="Apply with Channel"
      footer={
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!selectedChannel || selectedIndex < 0}
          loading={isSubmitting}
          onClick={handleConfirm}
          className="primary-glow"
        >
          <i className="ri-send-plane-fill mr-2" />
          Submit Application
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Campaign info */}
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="flex items-center gap-2 text-xs text-foreground-muted mb-1">
            <i className="ri-megaphone-line" />
            <span>Applying to campaign</span>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {campaignTitle}
          </p>
        </div>

        {/* Channel Selection */}
        <div>
          <h4 className="text-xs font-semibold text-foreground-muted mb-3 uppercase tracking-wider">
            Select Your Channel
          </h4>
          {isLoading ? (
            <p className="text-sm text-foreground-muted py-4 text-center">
              Loading channels...
            </p>
          ) : ownedChannels.length === 0 ? (
            <div className="text-center py-8 text-foreground-muted">
              <i className="ri-broadcast-line text-3xl mb-2" />
              <p className="text-sm">No channels available</p>
              <p className="text-xs mt-1">
                List a channel first to apply to campaigns
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {ownedChannels.map((channel) => {
                const isSelected = selectedChannel?.chatId === channel.chatId;

                return (
                  <button
                    key={channel.chatId}
                    onClick={() => {
                      const c = ownedChannels.find(
                        (c) => c.chatId === channel.chatId,
                      );
                      if (c) {
                        setSelectedChannel(c);
                        setAdTypeKeys(
                          Object.keys(c.pricing) as (keyof ChannelPricing)[],
                        );
                        setSelectedIndex(-1);
                      }
                    }}
                    className={`w-full p-3 rounded-xl border transition-all text-left ${
                      isSelected
                        ? "bg-primary/10 border-primary"
                        : "bg-white/5 border-white/10 hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 relative">
                        {channel.photo ? (
                          <Image
                            src={channel.photo}
                            alt={channel.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                            <i className="ri-telegram-fill text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-foreground text-sm truncate">
                          {channel.title}
                        </h5>
                        <div className="flex items-center gap-1.5 text-xs text-foreground-muted mt-0.5 min-w-0">
                          {channel.username && (
                            <>
                              <span className="truncate min-w-0">
                                @{channel.username}
                              </span>
                              <span className="flex-shrink-0">•</span>
                            </>
                          )}
                          <span className="flex-shrink-0">
                            {formatNumber(channel.stats.followers.current)}{" "}
                            subscribers
                          </span>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-white/30"
                        }`}
                      >
                        {isSelected && (
                          <i className="ri-check-line text-xs text-white" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Ad Type Selection */}
        {selectedChannel && (
          <div className="animate-fade-in">
            <h4 className="text-xs font-semibold text-foreground-muted mb-3 uppercase tracking-wider">
              Select Ad Type{" "}
              <span className="normal-case">(price per day)</span>
            </h4>
            <div className="space-y-2">
              {adTypeKeys.map((pricingKey, idx) => {
                const adTonPrice = selectedChannel.pricing[pricingKey]!;
                const isSelected = selectedIndex === idx;

                return (
                  <button
                    key={pricingKey}
                    tabIndex={0}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    onClick={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-primary/10 border-primary"
                        : "bg-white/5 border-white/10 hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-white/30"
                        }`}
                      >
                        {isSelected && (
                          <i className="ri-check-line text-xs text-white" />
                        )}
                      </div>
                      <span className="text-sm text-foreground">
                        {PRICING_LABELS[pricingKey]}
                      </span>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <TonPrice amount={adTonPrice} size="sm" />
                      <span className="text-xs text-foreground-muted">
                        ≈ ${Math.round(adTonPrice * usdRate)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price Info */}
        {selectedChannel && selectedIndex >= 0 && (
          <div className="bg-white/5 rounded-xl p-3 border border-white/10 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground-muted">
                Price per day
              </span>
              <TonPrice
                amount={selectedChannel.pricing[adTypeKeys[selectedIndex]]!}
                size="md"
              />
            </div>
            <p className="text-[10px] text-foreground-subtle mt-1">
              Duration and total price will be agreed during negotiation
            </p>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}

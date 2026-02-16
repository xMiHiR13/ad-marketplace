"use client";

import {
  ChannelCardSkeleton,
  CampaignCardSkeleton,
} from "@/components/skeleton";
import {
  SortBottomSheet,
  CHANNEL_SORT_OPTIONS,
  CAMPAIGN_SORT_OPTIONS,
  sortChannels,
  sortCampaigns,
} from "@/components/shared/SortBottomSheet";
import {
  ChannelFiltersUI,
  ChannelFilters,
  defaultChannelFilters,
  getChannelFilterCount,
} from "@/components/channel/ChannelFilters";
import {
  CampaignFiltersUI,
  CampaignFilters,
  defaultCampaignFilters,
  getCampaignFilterCount,
} from "@/components/campaign/CampaignFilters";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChannelCardType } from "@/types/channel";
import { TabBar } from "@/components/layout/TabBar";
import { SearchBar } from "@/components/shared/SearchBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useRouter, useSearchParams } from "next/navigation";
import { ChannelCard } from "@/components/channel/ChannelCard";
import { CampaignCard } from "@/components/campaign/CampaignCard";
import { FilterBottomSheet } from "@/components/layout/FilterBottomSheet";
import { Campaign } from "@/types/campaign";
import { useTelegram } from "@/contexts/TelegramContext";

const fetchChannels = async (): Promise<ChannelCardType[]> => {
  const res = await fetch("/api/channels");
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || "Failed to fetch channels");
  }

  return data.channels;
};

const fetchCampaigns = async (): Promise<Campaign[]> => {
  const res = await fetch("/api/campaigns");
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || "Failed to fetch campaigns");
  }

  return data.campaigns;
};

export default function Home() {
  const router = useRouter();
  const { telegram } = useTelegram();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState("");

  const activeTab = searchParams.get("tab") || "channels";

  const {
    data: channels,
    isFetched: isFetchedChannels,
    isLoading: channelsLoading,
  } = useQuery({
    queryKey: ["channels"],
    queryFn: fetchChannels,
    enabled: activeTab === "channels",
  });

  const {
    data: campaigns,
    isFetched: isFetchedCampaigns,
    isLoading: campaignsLoading,
  } = useQuery({
    queryKey: ["campaigns"],
    queryFn: fetchCampaigns,
    enabled: activeTab === "campaigns",
  });

  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`);
  };
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const [channelFilters, setChannelFilters] = useState<ChannelFilters>(
    defaultChannelFilters,
  );
  const [tempChannelFilters, setTempChannelFilters] = useState<ChannelFilters>(
    defaultChannelFilters,
  );

  const [campaignFilters, setCampaignFilters] = useState<CampaignFilters>(
    defaultCampaignFilters,
  );
  const [tempCampaignFilters, setTempCampaignFilters] =
    useState<CampaignFilters>(defaultCampaignFilters);

  const [channelSort, setChannelSort] = useState("default");
  const [campaignSort, setCampaignSort] = useState("default");

  useDocumentTitle("Marketplace");

  const activeFilterCount = useMemo(() => {
    if (activeTab === "channels") {
      return getChannelFilterCount(channelFilters);
    }
    return getCampaignFilterCount(campaignFilters);
  }, [activeTab, channelFilters, campaignFilters]);

  const filteredChannels = useMemo(() => {
    if (!channels) return [];

    const filtered = channels.filter((c) => {
      if (
        searchValue &&
        !c.title.toLowerCase().includes(searchValue.toLowerCase())
      ) {
        return false;
      }

      if (channelFilters.adTypes.length > 0) {
        const hasMatchingAdType = channelFilters.adTypes.some(
          (type) => c.pricing?.[type] !== undefined,
        );
        if (!hasMatchingAdType) return false;
      }

      if (
        channelFilters.minSubscribers !== null &&
        (c.stats?.followers?.current ?? 0) < channelFilters.minSubscribers
      ) {
        return false;
      }

      if (
        channelFilters.minViews !== null &&
        (c.stats?.viewsPerPost?.current ?? 0) < channelFilters.minViews
      ) {
        return false;
      }

      if (
        channelFilters.minStoryViews !== null &&
        (c.stats?.viewsPerStory?.current ?? 0) < channelFilters.minStoryViews
      ) {
        return false;
      }

      if (
        channelFilters.minPrice !== null ||
        channelFilters.maxPrice !== null
      ) {
        const prices = Object.values(c.pricing ?? {}).filter(
          (p): p is number => typeof p === "number",
        );

        if (prices.length === 0) return false;

        const minChannelPrice = Math.min(...prices);

        if (
          channelFilters.minPrice !== null &&
          minChannelPrice < channelFilters.minPrice
        )
          return false;

        if (
          channelFilters.maxPrice !== null &&
          minChannelPrice > channelFilters.maxPrice
        )
          return false;
      }

      return true;
    });

    return sortChannels(filtered, channelSort);
  }, [channels, searchValue, channelFilters, channelSort]);

  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    const filtered = campaigns.filter((c) => {
      if (c.status !== "active") return false;

      if (
        searchValue &&
        !c.title.toLowerCase().includes(searchValue.toLowerCase())
      )
        return false;

      if (
        campaignFilters.categories.length > 0 &&
        (!c.category || !campaignFilters.categories.includes(c.category))
      )
        return false;

      if (campaignFilters.adTypes.length > 0) {
        const hasMatchingAdType = campaignFilters.adTypes.some((type) =>
          c.requirements.adTypes.includes(type),
        );
        if (!hasMatchingAdType) return false;
      }

      if (
        campaignFilters.minSubscribers !== null &&
        c.requirements.minSubscribers !== undefined &&
        c.requirements.minSubscribers < campaignFilters.minSubscribers
      )
        return false;

      if (
        campaignFilters.minPostViews !== null &&
        c.requirements.minPostViews !== undefined &&
        c.requirements.minPostViews < campaignFilters.minPostViews
      )
        return false;

      if (
        campaignFilters.minStoryViews !== null &&
        c.requirements.minStoryViews !== undefined &&
        c.requirements.minStoryViews < campaignFilters.minStoryViews
      )
        return false;

      if (
        campaignFilters.minBudget !== null &&
        c.budgetMax < campaignFilters.minBudget
      )
        return false;

      if (
        campaignFilters.maxBudget !== null &&
        c.budgetMin > campaignFilters.maxBudget
      )
        return false;

      return true;
    });
    return sortCampaigns(filtered, campaignSort);
  }, [campaigns, searchValue, campaignFilters, campaignSort]);

  const openFilters = () => {
    if (activeTab === "channels") {
      setTempChannelFilters(channelFilters);
    } else {
      setTempCampaignFilters(campaignFilters);
    }
    setFilterOpen(true);
  };

  const applyFilters = () => {
    if (activeTab === "channels") {
      setChannelFilters(tempChannelFilters);
    } else {
      setCampaignFilters(tempCampaignFilters);
    }
    setFilterOpen(false);
  };

  const resetFilters = () => {
    if (activeTab === "channels") {
      setTempChannelFilters(defaultChannelFilters);
    } else {
      setTempCampaignFilters(defaultCampaignFilters);
    }
  };

  const clearActiveFilters = () => {
    if (activeTab === "channels") {
      setChannelFilters(defaultChannelFilters);
    } else {
      setCampaignFilters(defaultCampaignFilters);
    }
  };

  const activeSort = activeTab === "channels" ? channelSort : campaignSort;

  const tabs = [
    {
      id: "channels",
      label: "Channels",
      count: isFetchedChannels ? filteredChannels.length : undefined,
    },
    {
      id: "campaigns",
      label: "Campaigns",
      count: isFetchedCampaigns ? filteredCampaigns.length : undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className={`sticky top-0 z-40 ${telegram?.isFullscreen ? "pt-20" : ""}`}>
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
        <div className="relative px-4 py-3 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Market
              </h1>
              <p className="text-xs text-foreground-muted mt-0.5">
                Discover channels & campaigns
              </p>
            </div>
          </div>
          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Search channels or campaigns..."
            onSortClick={() => setSortOpen(true)}
            isSortActive={activeSort !== "default"}
            onFilterClick={openFilters}
            filterCount={activeFilterCount}
          />
        </div>
      </header>

      <main className="px-4 py-3 space-y-3">
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "channels" && (
          <section aria-label="Channel listings" className="space-y-3">
            {channelsLoading ? (
              <>
                <ChannelCardSkeleton />
                <ChannelCardSkeleton />
                <ChannelCardSkeleton />
              </>
            ) : filteredChannels.length > 0 ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
                  <i className="ri-information-line text-sm text-primary" />
                  <span className="text-[11px] text-foreground-muted">
                    All listed rates are charged on a{" "}
                    <span className="text-foreground font-medium">
                      daily basis
                    </span>
                  </span>
                </div>
                {filteredChannels.map((channel) => (
                  <ChannelCard key={channel.chatId} data={channel} />
                ))}
              </>
            ) : filteredChannels.length === 0 ? (
              <EmptyState
                icon="ri-broadcast-line"
                title="No Channels Yet"
                description="Be the first to list your Telegram channel on the marketplace"
              />
            ) : (
              <EmptyState
                icon="ri-search-line"
                title="No Channels Found"
                description={
                  activeFilterCount > 0
                    ? "Try adjusting your filters"
                    : "No channels match your search"
                }
                actionLabel={
                  activeFilterCount > 0 ? "Clear Filters" : undefined
                }
                onAction={
                  activeFilterCount > 0 ? clearActiveFilters : undefined
                }
              />
            )}
          </section>
        )}

        {activeTab === "campaigns" && (
          <section aria-label="Campaign listings" className="space-y-3">
            {campaignsLoading ? (
              <>
                <CampaignCardSkeleton />
                <CampaignCardSkeleton />
                <CampaignCardSkeleton />
              </>
            ) : filteredCampaigns.length > 0 ? (
              filteredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} {...campaign} />
              ))
            ) : filteredCampaigns.filter((c) => c.status === "active")
                .length === 0 ? (
              <EmptyState
                icon="ri-megaphone-line"
                title="No Campaigns Yet"
                description="No active campaigns available at the moment"
              />
            ) : (
              <EmptyState
                icon="ri-search-line"
                title="No Campaigns Found"
                description={
                  activeFilterCount > 0
                    ? "Try adjusting your filters"
                    : "No campaigns match your search"
                }
                actionLabel={
                  activeFilterCount > 0 ? "Clear Filters" : undefined
                }
                onAction={
                  activeFilterCount > 0 ? clearActiveFilters : undefined
                }
              />
            )}
          </section>
        )}
      </main>

      <FilterBottomSheet
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        title={
          activeTab === "channels" ? "Channel Filters" : "Campaign Filters"
        }
        onReset={resetFilters}
        onApply={applyFilters}
      >
        {activeTab === "channels" ? (
          <ChannelFiltersUI
            filters={tempChannelFilters}
            onChange={setTempChannelFilters}
          />
        ) : (
          <CampaignFiltersUI
            filters={tempCampaignFilters}
            onChange={setTempCampaignFilters}
          />
        )}
      </FilterBottomSheet>

      <SortBottomSheet
        isOpen={sortOpen}
        onClose={() => setSortOpen(false)}
        title={activeTab === "channels" ? "Sort Channels" : "Sort Campaigns"}
        options={
          activeTab === "channels"
            ? CHANNEL_SORT_OPTIONS
            : CAMPAIGN_SORT_OPTIONS
        }
        activeSort={activeSort}
        onSort={(key) => {
          if (activeTab === "channels") {
            setChannelSort(key);
          } else {
            setCampaignSort(key);
          }
        }}
      />
    </div>
  );
}

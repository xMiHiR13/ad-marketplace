"use client";

import {
  SortBottomSheet,
  CHANNEL_SORT_OPTIONS,
  sortChannels,
} from "@/components/shared/SortBottomSheet";
import {
  ChannelFiltersUI,
  ChannelFilters,
  defaultChannelFilters,
  getChannelFilterCount,
} from "@/components/channel/ChannelFilters";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChannelCardType } from "@/types/channel";
import { SearchBar } from "@/components/shared/SearchBar";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ChannelCard } from "@/components/channel/ChannelCard";
import { ChannelCardSkeleton } from "@/components/skeleton";
import { FilterBottomSheet } from "@/components/layout/FilterBottomSheet";
import { useTelegram } from "@/contexts/TelegramContext";

const fetchChannels = async (): Promise<ChannelCardType[]> => {
  const res = await fetch("/api/channels");
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || "Failed to fetch channels");
  }

  return data.channels;
};

export default function ChannelsList() {
  const { telegram } = useTelegram();
  const [searchValue, setSearchValue] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [filters, setFilters] = useState<ChannelFilters>(defaultChannelFilters);
  const [tempFilters, setTempFilters] = useState<ChannelFilters>(
    defaultChannelFilters,
  );
  const [sortKey, setSortKey] = useState("default");

  const {
    data: channels,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["channels"],
    queryFn: fetchChannels,
  });

  useDocumentTitle("All Channels");

  const activeFilterCount = useMemo(
    () => getChannelFilterCount(filters),
    [filters],
  );

  const filteredChannels = useMemo(() => {
    if (!channels) return [];

    const filtered = channels.filter((c) => {
      if (
        searchValue &&
        !c.title.toLowerCase().includes(searchValue.toLowerCase())
      ) {
        return false;
      }

      if (filters.adTypes.length > 0) {
        const hasMatchingAdType = filters.adTypes.some(
          (type) => c.pricing?.[type] !== undefined,
        );
        if (!hasMatchingAdType) return false;
      }

      if (
        filters.minSubscribers !== null &&
        (c.stats?.followers?.current ?? 0) < filters.minSubscribers
      ) {
        return false;
      }

      if (
        filters.minViews !== null &&
        (c.stats?.viewsPerPost?.current ?? 0) < filters.minViews
      ) {
        return false;
      }

      if (
        filters.minStoryViews !== null &&
        (c.stats?.viewsPerStory?.current ?? 0) < filters.minStoryViews
      ) {
        return false;
      }

      if (filters.minPrice !== null || filters.maxPrice !== null) {
        const prices = Object.values(c.pricing ?? {}).filter(
          (p): p is number => typeof p === "number",
        );

        if (prices.length === 0) return false;

        const minChannelPrice = Math.min(...prices);

        if (filters.minPrice !== null && minChannelPrice < filters.minPrice)
          return false;

        if (filters.maxPrice !== null && minChannelPrice > filters.maxPrice)
          return false;
      }

      return true;
    });

    return sortChannels(filtered, sortKey);
  }, [channels, searchValue, filters, sortKey]);

  const openFilters = () => {
    setTempFilters(filters);
    setFilterOpen(true);
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setFilterOpen(false);
  };

  const resetFilters = () => {
    setTempFilters(defaultChannelFilters);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className={`sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border ${telegram?.isFullscreen ? "pt-20" : ""}`}>
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-foreground mb-4">
            All Channels
          </h1>
          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Search channels..."
            onSortClick={() => setSortOpen(true)}
            isSortActive={sortKey !== "default"}
            onFilterClick={openFilters}
            filterCount={activeFilterCount}
          />
        </div>
      </header>

      <main className="px-4 py-4 space-y-3">
        {!isLoading && filteredChannels.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
            <i className="ri-information-line text-sm text-primary" />
            <span className="text-[11px] text-foreground-muted">
              All listed rates are charged on a{" "}
              <span className="text-foreground font-medium">daily basis</span>
            </span>
          </div>
        )}
        {isLoading ? (
          <>
            <ChannelCardSkeleton />
            <ChannelCardSkeleton />
            <ChannelCardSkeleton />
          </>
        ) : filteredChannels.length > 0 ? (
          filteredChannels.map((channel) => (
            <ChannelCard key={channel.chatId} data={channel} />
          ))
        ) : (
          <div className="text-center py-12 text-foreground-muted">
            <i className="ri-broadcast-line text-4xl mb-2" />
            <p>No channels found</p>
            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilters(defaultChannelFilters)}
                className="mt-2 text-primary text-sm hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </main>

      <FilterBottomSheet
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Channel Filters"
        onReset={resetFilters}
        onApply={applyFilters}
      >
        <ChannelFiltersUI filters={tempFilters} onChange={setTempFilters} />
      </FilterBottomSheet>

      <SortBottomSheet
        isOpen={sortOpen}
        onClose={() => setSortOpen(false)}
        title="Sort Channels"
        options={CHANNEL_SORT_OPTIONS}
        activeSort={sortKey}
        onSort={setSortKey}
      />
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { Campaign } from "@/types/campaign";
import { useQuery } from "@tanstack/react-query";
import { SearchBar } from "@/components/shared/SearchBar";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { CampaignCardSkeleton } from "@/components/skeleton";
import { CampaignCard } from "@/components/campaign/CampaignCard";
import { FilterBottomSheet } from "@/components/layout/FilterBottomSheet";
import {
  SortBottomSheet,
  CAMPAIGN_SORT_OPTIONS,
  sortCampaigns,
} from "@/components/shared/SortBottomSheet";
import {
  CampaignFiltersUI,
  CampaignFilters,
  defaultCampaignFilters,
  getCampaignFilterCount,
} from "@/components/campaign/CampaignFilters";
import { useTelegram } from "@/contexts/TelegramContext";

const fetchCampaigns = async (): Promise<Campaign[]> => {
  const res = await fetch("/api/campaigns");
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error || data.message || "Failed to fetch campaigns");
  return data.campaigns;
};

export default function CampaignsList() {
  const { telegram } = useTelegram();
  const [searchValue, setSearchValue] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [filters, setFilters] = useState<CampaignFilters>(
    defaultCampaignFilters,
  );
  const [tempFilters, setTempFilters] = useState<CampaignFilters>(
    defaultCampaignFilters,
  );
  const [sortKey, setSortKey] = useState("default");

  const {
    data: campaigns,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["campaigns"],
    queryFn: fetchCampaigns,
  });

  useDocumentTitle("All Campaigns");

  const activeFilterCount = useMemo(
    () => getCampaignFilterCount(filters),
    [filters],
  );

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
        filters.categories.length > 0 &&
        (!c.category || !filters.categories.includes(c.category))
      )
        return false;

      if (filters.adTypes.length > 0) {
        const hasMatchingAdType = filters.adTypes.some((type) =>
          c.requirements.adTypes.includes(type),
        );
        if (!hasMatchingAdType) return false;
      }

      if (
        filters.minSubscribers !== null &&
        c.requirements.minSubscribers !== undefined &&
        c.requirements.minSubscribers < filters.minSubscribers
      )
        return false;

      if (
        filters.minPostViews !== null &&
        c.requirements.minPostViews !== undefined &&
        c.requirements.minPostViews < filters.minPostViews
      )
        return false;

      if (
        filters.minStoryViews !== null &&
        c.requirements.minStoryViews !== undefined &&
        c.requirements.minStoryViews < filters.minStoryViews
      )
        return false;

      if (filters.minBudget !== null && c.budgetMax < filters.minBudget)
        return false;

      if (filters.maxBudget !== null && c.budgetMin > filters.maxBudget)
        return false;

      return true;
    });
    return sortCampaigns(filtered, sortKey);
  }, [campaigns, searchValue, filters, sortKey]);

  const openFilters = () => {
    setTempFilters(filters);
    setFilterOpen(true);
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setFilterOpen(false);
  };

  const resetFilters = () => {
    setTempFilters(defaultCampaignFilters);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className={`sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border ${telegram?.isFullscreen ? "pt-20" : ""}`}>
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-foreground mb-4">
            All Campaigns
          </h1>
          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Search campaigns..."
            onSortClick={() => setSortOpen(true)}
            isSortActive={sortKey !== "default"}
            onFilterClick={openFilters}
            filterCount={activeFilterCount}
          />
        </div>
      </header>

      <main className="px-4 py-4 space-y-3">
        {isLoading ? (
          <>
            <CampaignCardSkeleton />
            <CampaignCardSkeleton />
            <CampaignCardSkeleton />
          </>
        ) : filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} {...campaign} />
          ))
        ) : (
          <div className="text-center py-12 text-foreground-muted">
            <i className="ri-megaphone-line text-4xl mb-2" />
            <p>No campaigns found</p>
            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilters(defaultCampaignFilters)}
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
        title="Campaign Filters"
        onReset={resetFilters}
        onApply={applyFilters}
      >
        <CampaignFiltersUI filters={tempFilters} onChange={setTempFilters} />
      </FilterBottomSheet>

      <SortBottomSheet
        isOpen={sortOpen}
        onClose={() => setSortOpen(false)}
        title="Sort Campaigns"
        options={CAMPAIGN_SORT_OPTIONS}
        activeSort={sortKey}
        onSort={setSortKey}
      />
    </div>
  );
}

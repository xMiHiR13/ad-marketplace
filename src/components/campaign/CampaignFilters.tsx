import {
  CampaignCategory,
  CAMPAIGN_CATEGORIES,
  CATEGORY_COLORS,
} from "@/types/campaign";
import { ChannelPricing } from "@/types/channel";

// Filter types for campaigns (status removed - only showing active campaigns)
export interface CampaignFilters {
  categories: CampaignCategory[];
  minBudget: number | null;
  maxBudget: number | null;
  adTypes: Array<keyof ChannelPricing>;
  minSubscribers: number | null;
  minPostViews: number | null;
  minStoryViews: number | null;
}

export const defaultCampaignFilters: CampaignFilters = {
  categories: [],
  minBudget: null,
  maxBudget: null,
  adTypes: [],
  minSubscribers: null,
  minPostViews: null,
  minStoryViews: null,
};

const BUDGET_OPTIONS = [
  { label: "Any", min: null, max: null },
  { label: "$500 - $1K", min: 500, max: 1000 },
  { label: "$1K - $3K", min: 1000, max: 3000 },
  { label: "> $3K", min: 3000, max: null },
];

const SUBSCRIBER_OPTIONS = [
  { label: "Any", min: null },
  { label: "> 50K", min: 50000 },
  { label: "> 100K", min: 100000 },
  { label: "> 200K", min: 200000 },
];

const VIEWS_OPTIONS = [
  { label: "Any", min: null },
  { label: "> 20K", min: 20000 },
  { label: "> 50K", min: 50000 },
];

const AD_TYPE_OPTIONS: Array<{
  key: keyof ChannelPricing;
  label: string;
  color: string;
}> = [
  {
    key: "post",
    label: "Post",
    color: "bg-primary/10 border-primary text-primary",
  },
  {
    key: "story",
    label: "Story",
    color: "bg-violet-500/10 border-violet-500 text-violet-400",
  },
  {
    key: "postWithForward",
    label: "Post + Forward",
    color: "bg-status-success/10 border-status-success text-status-success",
  },
];

interface CampaignFiltersUIProps {
  filters: CampaignFilters;
  onChange: (filters: CampaignFilters) => void;
}

export function CampaignFiltersUI({
  filters,
  onChange,
}: CampaignFiltersUIProps) {
  const toggleCategory = (category: CampaignCategory) => {
    onChange({
      ...filters,
      categories: filters.categories.includes(category)
        ? filters.categories.filter((c) => c !== category)
        : [...filters.categories, category],
    });
  };

  const toggleAdType = (key: keyof ChannelPricing) => {
    onChange({
      ...filters,
      adTypes: filters.adTypes.includes(key)
        ? filters.adTypes.filter((t) => t !== key)
        : [...filters.adTypes, key],
    });
  };

  const setBudgetRange = (min: number | null, max: number | null) => {
    onChange({ ...filters, minBudget: min, maxBudget: max });
  };

  const setSubscriberRange = (min: number | null) => {
    onChange({ ...filters, minSubscribers: min });
  };

  const setPostViewsRange = (min: number | null) => {
    onChange({ ...filters, minPostViews: min });
  };

  const setStoryViewsRange = (min: number | null) => {
    onChange({ ...filters, minStoryViews: min });
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="text-xs font-semibold text-foreground-muted mb-3 uppercase tracking-wider">
          <i className="ri-price-tag-3-line mr-1 text-amber-400" />
          Category
        </h3>
        <div className="flex flex-wrap gap-2">
          {CAMPAIGN_CATEGORIES.map((category) => {
            const isSelected = filters.categories.includes(category);
            return (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                  isSelected
                    ? CATEGORY_COLORS[category]
                    : "bg-white/5 border-white/10 text-foreground-muted hover:border-white/20"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ad Type Filter */}
      <div>
        <h3 className="text-xs font-semibold text-foreground-muted mb-3 uppercase tracking-wider">
          <i className="ri-file-list-3-line mr-1 text-orange-400" />
          Ad Type
        </h3>
        <div className="flex flex-wrap gap-2">
          {AD_TYPE_OPTIONS.map((option) => {
            const isSelected = filters.adTypes.includes(option.key);
            return (
              <button
                key={option.key}
                onClick={() => toggleAdType(option.key)}
                className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                  isSelected
                    ? option.color
                    : "bg-white/5 border-white/10 text-foreground-muted hover:border-white/20"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subscribers Filter */}
      <div>
        <h3 className="text-xs font-semibold text-foreground-muted mb-3 uppercase tracking-wider">
          <i className="ri-user-3-line mr-1 text-primary" />
          Min. Subscribers
        </h3>
        <div className="flex flex-wrap gap-2">
          {SUBSCRIBER_OPTIONS.map((option) => {
            const isSelected = filters.minSubscribers === option.min;
            return (
              <button
                key={option.label}
                onClick={() => setSubscriberRange(option.min)}
                className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-white/5 border-white/10 text-foreground-muted hover:border-white/20"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Post Views Filter */}
      <div>
        <h3 className="text-xs font-semibold text-foreground-muted mb-3 uppercase tracking-wider">
          <i className="ri-eye-line mr-1 text-cyan-400" />
          Min. Avg. Post Views
        </h3>
        <div className="flex flex-wrap gap-2">
          {VIEWS_OPTIONS.map((option) => {
            const isSelected = filters.minPostViews === option.min;
            return (
              <button
                key={option.label}
                onClick={() => setPostViewsRange(option.min)}
                className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-cyan-500/10 border-cyan-500 text-cyan-400"
                    : "bg-white/5 border-white/10 text-foreground-muted hover:border-white/20"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Story Views Filter */}
      <div>
        <h3 className="text-xs font-semibold text-foreground-muted mb-3 uppercase tracking-wider">
          <i className="ri-flashlight-line mr-1 text-violet-400" />
          Min. Avg. Story Views
        </h3>
        <div className="flex flex-wrap gap-2">
          {VIEWS_OPTIONS.map((option) => {
            const isSelected = filters.minStoryViews === option.min;
            return (
              <button
                key={option.label}
                onClick={() => setStoryViewsRange(option.min)}
                className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-violet-500/10 border-violet-500 text-violet-400"
                    : "bg-white/5 border-white/10 text-foreground-muted hover:border-white/20"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Budget Range Filter */}
      <div>
        <h3 className="text-xs font-semibold text-foreground-muted mb-3 uppercase tracking-wider">
          <i className="ri-money-dollar-circle-line mr-1 text-emerald-400" />
          Budget Range
        </h3>
        <div className="flex flex-wrap gap-2">
          {BUDGET_OPTIONS.map((option) => {
            const isSelected =
              filters.minBudget === option.min &&
              filters.maxBudget === option.max;
            return (
              <button
                key={option.label}
                onClick={() => setBudgetRange(option.min, option.max)}
                className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                    : "bg-white/5 border-white/10 text-foreground-muted hover:border-white/20"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const getCampaignFilterCount = (filters: CampaignFilters): number => {
  let count = 0;
  if (filters.categories.length > 0) count++;
  if (filters.minBudget !== null || filters.maxBudget !== null) count++;
  if (filters.adTypes.length > 0) count++;
  if (filters.minSubscribers !== null) count++;
  if (filters.minPostViews !== null) count++;
  if (filters.minStoryViews !== null) count++;
  return count;
};

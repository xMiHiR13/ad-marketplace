import { ChannelPricing } from "@/types/channel";

// Filter types for channels
export interface ChannelFilters {
  adTypes: Array<keyof ChannelPricing>;
  minSubscribers: number | null;
  minViews: number | null;
  minStoryViews: number | null;
  minPrice: number | null;
  maxPrice: number | null;
}

export const defaultChannelFilters: ChannelFilters = {
  adTypes: [],
  minSubscribers: null,
  minViews: null,
  minStoryViews: null,
  minPrice: null,
  maxPrice: null,
};

const SUBSCRIBER_OPTIONS = [
  { label: "Any", min: null },
  { label: "> 100K", min: 100000 },
  { label: "> 500K", min: 500000 },
];

const VIEWS_OPTIONS = [
  { label: "Any", min: null },
  { label: "> 20K", min: 20000 },
  { label: "> 50K", min: 50000 },
];

const PRICE_OPTIONS = [
  { label: "Any", min: null, max: null },
  { label: "< $100", min: null, max: 100 },
  { label: "$100 - $200", min: 100, max: 200 },
  { label: "$200 - $500", min: 200, max: 500 },
  { label: "> $500", min: 500, max: null },
];

const AD_TYPE_OPTIONS: Array<{
  key: keyof ChannelPricing;
  label: string;
  color: string;
}> = [
  {
    key: "post",
    label: "Post Ad",
    color: "bg-primary/10 border-primary text-primary",
  },
  {
    key: "story",
    label: "Story Ad",
    color: "bg-violet-500/10 border-violet-500 text-violet-400",
  },
  {
    key: "postWithForward",
    label: "Post + Forward",
    color: "bg-status-success/10 border-status-success text-status-success",
  },
];

interface ChannelFiltersUIProps {
  filters: ChannelFilters;
  onChange: (filters: ChannelFilters) => void;
}

export function ChannelFiltersUI({ filters, onChange }: ChannelFiltersUIProps) {
  const toggleAdType = (key: keyof ChannelPricing) => {
    onChange({
      ...filters,
      adTypes: filters.adTypes.includes(key)
        ? filters.adTypes.filter((t) => t !== key)
        : [...filters.adTypes, key],
    });
  };

  const setSubscriberRange = (min: number | null) => {
    onChange({ ...filters, minSubscribers: min });
  };

  const setViewsRange = (min: number | null) => {
    onChange({ ...filters, minViews: min });
  };

  const setStoryViewsRange = (min: number | null) => {
    onChange({ ...filters, minStoryViews: min });
  };

  const setPriceRange = (min: number | null, max: number | null) => {
    onChange({ ...filters, minPrice: min, maxPrice: max });
  };

  return (
    <div className="space-y-6">
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
            const isSelected = filters.minViews === option.min;
            return (
              <button
                key={option.label}
                onClick={() => setViewsRange(option.min)}
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

      {/* Price Filter */}
      <div>
        <h3 className="text-xs font-semibold text-foreground-muted mb-3 uppercase tracking-wider">
          <i className="ri-money-dollar-circle-line mr-1 text-emerald-400" />
          Price Range
        </h3>
        <div className="flex flex-wrap gap-2">
          {PRICE_OPTIONS.map((option) => {
            const isSelected =
              filters.minPrice === option.min &&
              filters.maxPrice === option.max;
            return (
              <button
                key={option.label}
                onClick={() => setPriceRange(option.min, option.max)}
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

export const getChannelFilterCount = (filters: ChannelFilters): number => {
  let count = 0;
  if (filters.adTypes.length > 0) count++;
  if (filters.minSubscribers !== null) count++;
  if (filters.minViews !== null) count++;
  if (filters.minStoryViews !== null) count++;
  if (filters.minPrice !== null || filters.maxPrice !== null) count++;
  return count;
};

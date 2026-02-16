import { ChannelCardType } from "@/types/channel";
import { BottomSheet } from "@/components/layout/BottomSheet";

export interface SortOption {
  key: string;
  label: string;
  icon: string;
}

interface SortBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: SortOption[];
  activeSort: string;
  onSort: (key: string) => void;
}

export function SortBottomSheet({
  isOpen,
  onClose,
  title,
  options,
  activeSort,
  onSort,
}: SortBottomSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-1">
        {options.map((option) => {
          const isActive = activeSort === option.key;
          return (
            <button
              key={option.key}
              onClick={() => {
                onSort(option.key);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary/10 border border-primary text-primary"
                  : "bg-white/5 border border-transparent text-foreground-muted hover:bg-white/10 hover:text-foreground"
              }`}
            >
              <i className={`${option.icon} text-base ${isActive ? "text-primary" : ""}`} />
              <span className="flex-1 text-left">{option.label}</span>
              {isActive && <i className="ri-check-line text-base text-primary" />}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}

// Channel sort options
export const CHANNEL_SORT_OPTIONS: SortOption[] = [
  { key: "default", label: "Default", icon: "ri-list-unordered" },
  { key: "subscribers_desc", label: "Subscribers: High → Low", icon: "ri-arrow-down-line" },
  { key: "subscribers_asc", label: "Subscribers: Low → High", icon: "ri-arrow-up-line" },
  { key: "views_desc", label: "Post Views: High → Low", icon: "ri-arrow-down-line" },
  { key: "views_asc", label: "Post Views: Low → High", icon: "ri-arrow-up-line" },
  { key: "price_asc", label: "Price: Low → High", icon: "ri-arrow-up-line" },
  { key: "price_desc", label: "Price: High → Low", icon: "ri-arrow-down-line" },
];

// Campaign sort options
export const CAMPAIGN_SORT_OPTIONS: SortOption[] = [
  { key: "default", label: "Default", icon: "ri-list-unordered" },
  { key: "budget_desc", label: "Budget: High → Low", icon: "ri-arrow-down-line" },
  { key: "budget_asc", label: "Budget: Low → High", icon: "ri-arrow-up-line" },
  { key: "newest", label: "Newest First", icon: "ri-time-line" },
  { key: "oldest", label: "Oldest First", icon: "ri-history-line" },
];

// Sort helpers
export const sortChannels = (
  channels: ChannelCardType[],
  sortKey: string
): ChannelCardType[] => {
  if (sortKey === "default") return channels;
  
  return [...channels].sort((a, b) => {
    switch (sortKey) {
      case "subscribers_desc":
        return b.stats.followers.current - a.stats.followers.current;
      case "subscribers_asc":
        return a.stats.followers.current - b.stats.followers.current;
      case "views_desc":
        return b.stats.viewsPerPost.current - a.stats.viewsPerPost.current;
      case "views_asc":
        return a.stats.viewsPerPost.current - b.stats.viewsPerPost.current;
      case "price_asc": {
        const aMin = Math.min(...Object.values(a.pricing).filter((p): p is number => p !== undefined));
        const bMin = Math.min(...Object.values(b.pricing).filter((p): p is number => p !== undefined));
        return aMin - bMin;
      }
      case "price_desc": {
        const aMin = Math.min(...Object.values(a.pricing).filter((p): p is number => p !== undefined));
        const bMin = Math.min(...Object.values(b.pricing).filter((p): p is number => p !== undefined));
        return bMin - aMin;
      }
      default:
        return 0;
    }
  });
};

export const sortCampaigns = <T extends { budgetMax: number; createdAt: Date }>(
  campaigns: T[],
  sortKey: string
): T[] => {
  if (sortKey === "default") return campaigns;
  
  return [...campaigns].sort((a, b) => {
    switch (sortKey) {
      case "budget_desc":
        return b.budgetMax - a.budgetMax;
      case "budget_asc":
        return a.budgetMax - b.budgetMax;
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      default:
        return 0;
    }
  });
};

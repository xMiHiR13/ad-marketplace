// Channel - Represents a Telegram channel with embedded stats
export interface ChannelPricing {
  post?: number; // Price for normal post ad
  story?: number; // Price for story ad
  postWithForward?: number; // Price for post + forward tag
}

// Metric pair for current/previous comparison
export interface MetricPair {
  current: number;
  previous: number;
}

// Views by hour data point (24 hours) - supports two week comparison
export interface HourlyViewsSeries {
  hour: number; // 0-23 (UTC)
  currentWeek: number; // Views for current week (y0)
  previousWeek: number; // Views for previous week (y1)
}

// Language distribution - part/total format
export interface LanguageShare {
  code: string; // Language code (e.g., "en", "ru", "es")
  name: string; // Display name (e.g., "English", "Russian")
  part: number; // Number of subscribers with this language
}

export interface ChannelStats {
  followers: MetricPair;

  // Post metrics
  viewsPerPost: MetricPair;
  sharesPerPost: MetricPair;
  reactionsPerPost: MetricPair;

  // Story metrics
  viewsPerStory: MetricPair;
  sharesPerStory: MetricPair;
  reactionsPerStory: MetricPair;

  enabledNotifications: {
    part: number; // Users with notifications enabled
    total: number; // Total subscribers
  };

  // Premium subscribers - part/total format like enabledNotifications
  premiumSubscribers: {
    part: number; // Approximate number of premium users
    total: number; // Total subscribers
  };

  // Top hours for posting (views by hour UTC) - 24 data points with week comparison
  topHours: HourlyViewsSeries[];
  topHoursDateRanges: {
    current: string; // e.g., "Jan 27 - Feb 02"
    previous: string; // e.g., "Jan 20 - Jan 26"
  };

  // Language distribution of subscribers
  languages: LanguageShare[];

  fetchedAt: Date; // ISO timestamp of last stats update
}

// Channel with embedded stats - single unified type
export interface Channel {
  // Core channel info
  chatId: number; // Telegram chatId (NOT username)
  title: string;
  username?: string;
  photo?: string;
  link: string; // Public Telegram channel link
  pricing: ChannelPricing;
  ownerId: number; // User ID of the channel owner
  managerIds: number[]; // User IDs of channel managers
  payoutAddress: string; // TON wallet address for receiving deal payments (required)
  stats: ChannelStats;
}

export type ChannelCardType = Pick<Channel, "chatId" | "title" | "username" | "photo" | "pricing" | "stats">;

// Pricing label mapping
export const PRICING_LABELS: Record<keyof ChannelPricing, string> = {
  post: "Post Ad",
  story: "Story Ad",
  postWithForward: "Post + Forward",
};

export const METRIC_COLORS = {
  subscribers: "text-primary",
  notifications: "text-status-success",
  views: "text-cyan-400",
  shares: "text-status-warning",
  reactions: "text-pink-400",
} as const;
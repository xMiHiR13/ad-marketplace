// Campaign - Represents an advertisement campaign
import { ChannelPricing } from "./channel";

export type CampaignCategory = "Tech" | "Health" | "Finance" | "Gaming" | "Education" | "Lifestyle" | "Crypto";

export type CampaignStatus = "active" | "closed" | "draft";

export type CampaignLanguage = "English" | "Russian" | "Spanish" | "German" | "French" | "Arabic" | "Chinese" | "Hindi" | "Portuguese" | "Japanese" | "Korean" | "Turkish" | "Italian" | "Dutch" | "Polish" | "Ukrainian" | "Vietnamese" | "Thai" | "Indonesian" | "Malay" | "Persian" | "Swedish" | "Czech" | "Romanian" | "Hungarian" | "Greek" | "Bengali" | "Urdu" | "Filipino";

export const CAMPAIGN_LANGUAGES: CampaignLanguage[] = [
  "English", "Russian", "Spanish", "German", "French", "Arabic",
  "Chinese", "Hindi", "Portuguese", "Japanese", "Korean", "Turkish",
  "Italian", "Dutch", "Polish", "Ukrainian", "Vietnamese", "Thai",
  "Indonesian", "Malay", "Persian", "Swedish", "Czech", "Romanian",
  "Hungarian", "Greek", "Bengali", "Urdu", "Filipino",
];

// Rotating color palette for language chips
const LANGUAGE_CHIP_COLORS = [
  "bg-cyan-500/10 border-cyan-500/40 text-cyan-400",
  "bg-violet-500/10 border-violet-500/40 text-violet-400",
  "bg-emerald-500/10 border-emerald-500/40 text-emerald-400",
  "bg-amber-500/10 border-amber-500/40 text-amber-400",
  "bg-pink-500/10 border-pink-500/40 text-pink-400",
  "bg-blue-500/10 border-blue-500/40 text-blue-400",
  "bg-orange-500/10 border-orange-500/40 text-orange-400",
  "bg-rose-500/10 border-rose-500/40 text-rose-400",
  "bg-teal-500/10 border-teal-500/40 text-teal-400",
  "bg-indigo-500/10 border-indigo-500/40 text-indigo-400",
];

export const getLanguageColor = (lang: CampaignLanguage): string => {
  const index = CAMPAIGN_LANGUAGES.indexOf(lang);
  return LANGUAGE_CHIP_COLORS[index % LANGUAGE_CHIP_COLORS.length];
};

// Static selected colors to ensure Tailwind JIT detects all classes
const LANGUAGE_CHIP_SELECTED_COLORS = [
  "bg-cyan-500/20 border-cyan-500 text-cyan-400",
  "bg-violet-500/20 border-violet-500 text-violet-400",
  "bg-emerald-500/20 border-emerald-500 text-emerald-400",
  "bg-amber-500/20 border-amber-500 text-amber-400",
  "bg-pink-500/20 border-pink-500 text-pink-400",
  "bg-blue-500/20 border-blue-500 text-blue-400",
  "bg-orange-500/20 border-orange-500 text-orange-400",
  "bg-rose-500/20 border-rose-500 text-rose-400",
  "bg-teal-500/20 border-teal-500 text-teal-400",
  "bg-indigo-500/20 border-indigo-500 text-indigo-400",
];

export const getLanguageSelectedColor = (lang: CampaignLanguage): string => {
  const index = CAMPAIGN_LANGUAGES.indexOf(lang);
  return LANGUAGE_CHIP_SELECTED_COLORS[index % LANGUAGE_CHIP_SELECTED_COLORS.length];
};

export interface CampaignRequirements {
  minSubscribers?: number;
  minPostViews?: number;
  minStoryViews?: number;
  adTypes: Array<keyof ChannelPricing>;
  languages?: CampaignLanguage[];
}

export interface Campaign {
  ownerId: number;
  id: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  category?: CampaignCategory;
  status: CampaignStatus;
  requirements: CampaignRequirements;
  createdAt: Date;
}

// Category options for filtering
export const CAMPAIGN_CATEGORIES: CampaignCategory[] = [
  "Tech",
  "Health",
  "Finance",
  "Gaming",
  "Education",
  "Lifestyle",
  "Crypto",
];

// Category color mapping
export const CATEGORY_COLORS: Record<CampaignCategory, string> = {
  Tech: "bg-cyan-500/10 border-cyan-500 text-cyan-400",
  Health: "bg-emerald-500/10 border-emerald-500 text-emerald-400",
  Finance: "bg-amber-500/10 border-amber-500 text-amber-400",
  Gaming: "bg-violet-500/10 border-violet-500 text-violet-400",
  Education: "bg-blue-500/10 border-blue-500 text-blue-400",
  Lifestyle: "bg-pink-500/10 border-pink-500 text-pink-400",
  Crypto: "bg-orange-500/10 border-orange-500 text-orange-400",
};

// Ad type labels
export const AD_TYPE_LABELS: Record<keyof ChannelPricing, string> = {
  post: "Post",
  story: "Story",
  postWithForward: "Post + Forward",
};

export const AD_TYPE_COLORS: Record<keyof ChannelPricing, string> = {
  post: "bg-primary/10 border-primary text-primary",
  story: "bg-violet-500/10 border-violet-500 text-violet-400",
  postWithForward: "bg-status-success/10 border-status-success text-status-success",
};

// Deal - Represents a transaction between advertiser and publisher

// Define runtime values
export const DEAL_STATUS = [
  // Negotiation
  "negotiating",
  "price_proposed",

  // Creation & Review
  "awaiting_ad_submission",
  "ad_under_review",
  "ad_rejected",

  // Payment
  "awaiting_payment",

  // Execution
  "scheduled",
  "posted",

  // Verification
  "verified",

  // Terminal
  "completed",
  "posting_failed",
  "refunded_edit",
  "refunded_delete",
  "cancelled",
] as const;

// Derive TypeScript type from the array
export type DealStatus = (typeof DEAL_STATUS)[number];

export type AdType = "post" | "story" | "postWithForward";

export type DealRole = "advertiser" | "publisher" | "manager";

export interface Deal {
  id: string;

  status: DealStatus;

  advertiserId: number;
  publisherId: number;
  managerIds: number[];

  channel: {
    chatId: number;
    title: string;
    link: string;
    payoutAddress: string;
    photo?: string;
    username?: string;
  };

  campaign?: {
    id: string;
    title: string;
    description: string;
  };

  adType: AdType;
  duration: number; // 1-7 days
  price: number; // TON per day, initial per day price (immutable, from channel listing)
  escrowAddress?: string;

  negotiation?: {
    proposedPrice: number; // Total price proposed (not per day)
    proposedBy: "advertiser" | "publisher";
    proposedAt: Date;
    acceptedAt?: Date;
  };

  ad?: {
    chatId: number;
    messageId: number;
    submittedAt: Date;
    
    approvedAt?: Date;
    rejectedAt?: Date;
  };

  payment?: {
    senderAddress: string;
    txHash: string;
    paidAt: Date;
    refundedAt?: Date;
  };

  schedule: {
    postAt?: Date;
    post?: {
      postedAt: Date;
      messageId: number;
    },
    verifiedAt?: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}

export interface DealCardType extends Pick<
  Deal,
  "id" | "adType" | "status" | "price" | "createdAt"
> {
  channel: Pick<Deal["channel"], "title" | "photo">;
  campaign?: Pick<NonNullable<Deal["campaign"]>, "title">;
  role: DealRole;
}

// Status labels for UI display
export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  negotiating: "Negotiating",
  price_proposed: "Price Proposed",
  awaiting_ad_submission: "Submit Ad",
  ad_under_review: "Under Review",
  ad_rejected: "Ad Rejected",
  awaiting_payment: "Awaiting Payment",
  scheduled: "Scheduled",
  posted: "Posted",
  verified: "Verified",
  completed: "Completed",
  posting_failed: "Posting Failed",
  refunded_edit: "Refunded (Edited)",
  refunded_delete: "Refunded (Deleted)",
  cancelled: "Cancelled",
};

// Status type for badge coloring
export const DEAL_STATUS_TYPE: Record<
  DealStatus,
  "pending" | "success" | "error" | "neutral"
> = {
  negotiating: "pending",
  price_proposed: "pending",
  awaiting_ad_submission: "pending",
  ad_under_review: "pending",
  ad_rejected: "error",
  awaiting_payment: "pending",
  scheduled: "pending",
  posted: "pending",
  verified: "success",
  completed: "success",
  posting_failed: "error",
  refunded_edit: "error",
  refunded_delete: "error",
  cancelled: "neutral",
};

// Ad type labels for UI
export const AD_TYPE_LABELS: Record<AdType, string> = {
  post: "Post Ad",
  story: "Story Ad",
  postWithForward: "Forward",
};

// Timeline steps based on deal status flow
export const DEAL_TIMELINE_STEPS = [
  {
    id: "negotiation",
    label: "Negotiation",
    completedLabel: "Agreed",
    icon: "ri-discuss-line",
  },
  {
    id: "ad_submission",
    label: "Ad Submit",
    completedLabel: "Submitted",
    icon: "ri-image-line",
  },
  {
    id: "review",
    label: "Review",
    completedLabel: "Approved",
    icon: "ri-search-eye-line",
  },
  {
    id: "payment",
    label: "Payment",
    completedLabel: "Paid",
    icon: "ri-wallet-3-line",
  },
  {
    id: "posting",
    label: "Posting",
    completedLabel: "Posted",
    icon: "ri-send-plane-2-line",
  },
  {
    id: "verification",
    label: "Verification",
    completedLabel: "Verified",
    icon: "ri-checkbox-circle-line",
  },
] as const;

// Map status to timeline step index
export const getTimelineStepIndex = (status: DealStatus): number => {
  const mapping: Record<DealStatus, number> = {
    negotiating: 0,
    price_proposed: 0,
    awaiting_ad_submission: 1,
    ad_under_review: 2,
    ad_rejected: 2,
    awaiting_payment: 3,
    scheduled: 4,
    posted: 5,
    verified: 5,
    completed: 6,
    posting_failed: 5,
    refunded_edit: 5,
    refunded_delete: 5,
    cancelled: -1,
  };
  return mapping[status];
};

// Check if deal is in a terminal state
export const isDealTerminal = (status: DealStatus): boolean => {
  return [
    "completed",
    "posting_failed",
    "refunded_edit",
    "refunded_delete",
    "cancelled",
  ].includes(status);
};

// Check if deal is in an error state
export const isDealError = (status: DealStatus): boolean => {
  return [
    "ad_rejected",
    "posting_failed",
    "refunded_edit",
    "refunded_delete",
  ].includes(status);
};

// Check if deal is refunded
export const isDealRefunded = (status: DealStatus): boolean => {
  return ["refunded_edit", "refunded_delete"].includes(status);
};

// Check if deal is in negotiation phase
export const isDealNegotiating = (status: DealStatus): boolean => {
  return ["negotiating", "price_proposed"].includes(status);
};

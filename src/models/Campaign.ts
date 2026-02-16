import { Campaign as CampaignType } from "@/types/campaign";
import mongoose, { Schema, Model } from "mongoose";

export interface ICampaign extends CampaignType {
  updatedAt: Date;
}

const RequirementsSchema = new Schema(
  {
    minSubscribers: { type: Number },
    minPostViews: { type: Number },
    minStoryViews: { type: Number },

    adTypes: {
      type: [String],
      enum: ["post", "story", "postWithForward"],
      required: true,
    },

    languages: {
      type: [String],
    },
  },
  { _id: false }, // prevents extra _id inside nested object
);

const CampaignSchema = new Schema<ICampaign>(
  {
    ownerId: {
      type: Number,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    budgetMin: {
      type: Number,
      required: true,
      min: 0,
    },

    budgetMax: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },

    requirements: {
      type: RequirementsSchema,
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // adds updatedAt automatically
  },
);

CampaignSchema.index({ ownerId: 1 });

export const Campaign: Model<ICampaign> =
  mongoose.models.Campaign ||
  mongoose.model<ICampaign>("Campaign", CampaignSchema);

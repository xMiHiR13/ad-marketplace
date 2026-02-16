import mongoose, { Schema, Model } from "mongoose";
import { Channel as ChannelType } from "@/types/channel";

export interface IChannel extends ChannelType {
  updatedAt: Date;
}

const MetricSchema = new Schema(
  {
    current: { type: Number, required: true },
    previous: { type: Number, required: true },
  },
  { _id: false },
);

const RatioSchema = new Schema(
  {
    part: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false },
);

const HourlyViewsSchema = new Schema(
  {
    hour: { type: Number, min: 0, max: 23, required: true },
    currentWeek: { type: Number, required: true },
    previousWeek: { type: Number, required: true },
  },
  { _id: false },
);

const LanguageSchema = new Schema(
  {
    code: { type: String, required: true },
    name: { type: String, required: true },
    part: { type: Number, required: true },
  },
  { _id: false },
);

const PricingSchema = new Schema(
  {
    post: { type: Number },
    story: { type: Number },
    postWithForward: { type: Number },
  },
  { _id: false },
);

const ChannelSchema = new Schema<IChannel>(
  {
    chatId: {
      type: Number,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      trim: true,
    },

    photo: {
      type: String,
    },

    link: {
      type: String,
      required: true,
    },

    pricing: {
      type: PricingSchema,
      required: true,
    },

    ownerId: {
      type: Number,
      required: true,
    },

    managerIds: {
      type: [Number],
      default: [],
    },

    payoutAddress: {
      type: String,
      required: true,
    },

    stats: {
      followers: { type: MetricSchema, required: true },
      viewsPerPost: { type: MetricSchema, required: true },
      sharesPerPost: { type: MetricSchema, required: true },
      reactionsPerPost: { type: MetricSchema, required: true },
      viewsPerStory: { type: MetricSchema, required: true },
      sharesPerStory: { type: MetricSchema, required: true },
      reactionsPerStory: { type: MetricSchema, required: true },

      enabledNotifications: { type: RatioSchema, required: true },
      premiumSubscribers: { type: RatioSchema, required: true },

      topHours: {
        type: [HourlyViewsSchema],
        validate: [(val: any[]) => val.length === 24, "Must contain 24 hours"],
      },

      topHoursDateRanges: {
        current: { type: String, required: true },
        previous: { type: String, required: true },
      },

      languages: {
        type: [LanguageSchema],
        default: [],
      },

      fetchedAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  },
);

ChannelSchema.index({ chatId: 1 }, { unique: true });
ChannelSchema.index({ ownerId: 1 });
ChannelSchema.index({ "followers.current": -1 });
ChannelSchema.index({ "viewsPerPost.current": -1 });
ChannelSchema.index({ "languages.code": 1 });

export const Channel: Model<IChannel> =
  mongoose.models.Channel || mongoose.model<IChannel>("Channel", ChannelSchema);

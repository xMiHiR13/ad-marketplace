import { Deal as DealType, DEAL_STATUS } from "@/types/deal";
import mongoose, { Schema, Model } from "mongoose";

const DealChannelSchema = new Schema(
  {
    chatId: { type: Number, required: true },
    title: { type: String, required: true },
    link: { type: String, required: true },
    payoutAddress: { type: String, required: true },
    photo: { type: String },
    username: { type: String },
  },
  { _id: false },
);

const DealCampaignSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false },
);

const NegotiationSchema = new Schema(
  {
    proposedPrice: { type: Number, required: true }, // total price
    proposedBy: {
      type: String,
      enum: ["advertiser", "publisher"],
      required: true,
    },
    proposedAt: { type: Date, required: true },
    acceptedAt: { type: Date },
  },
  { _id: false },
);

const AdSchema = new Schema(
  {
    chatId: Number,
    messageId: Number,
    submittedAt: Date,
    approvedAt: Date,
    rejectedAt: Date,
  },
  { _id: false },
);

const PaymentSchema = new Schema(
  {
    senderAddress: String,
    txHash: String,
    paidAt: Date,
    refundedAt: Date,
  },
  { _id: false },
);

const ScheduleSchema = new Schema(
  {
    postAt: Date,
    post: {
      messageId: Number,
      postedAt: Date,
    },
    verifiedAt: Date,
  },
  { _id: false },
);

export interface IDeal extends DealType {
  createdAt: Date;
  updatedAt: Date;
}

const DealSchema = new Schema<IDeal>(
  {
    advertiserId: { type: Number, required: true },
    publisherId: { type: Number, required: true },
    managerIds: { type: [Number], default: [] },

    channel: { type: DealChannelSchema, required: true },
    campaign: { type: DealCampaignSchema, required: false },

    status: {
      type: String,
      enum: DEAL_STATUS,
      required: true,
    },

    adType: {
      type: String,
      enum: ["post", "story", "postWithForward"],
      required: true,
    },

    duration: {
      type: Number,
      min: 0,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    escrowAddress: {
      type: String,
      trim: true,
    },

    negotiation: NegotiationSchema,
    ad: AdSchema,
    payment: PaymentSchema,
    schedule: ScheduleSchema,
  },
  {
    timestamps: true,
  },
);

DealSchema.index({ "channel.chatId": 1 });
DealSchema.index({ advertiserId: 1, status: 1 });
DealSchema.index({ publisherId: 1, status: 1 });
DealSchema.index({ createdAt: -1 });
DealSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    const { _id, ...rest } = ret;
    return {
      ...rest,
      id: _id.toString(),
    };
  },
});

export const Deal: Model<IDeal> =
  mongoose.models.Deal || mongoose.model<IDeal>("Deal", DealSchema);

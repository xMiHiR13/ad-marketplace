import mongoose, { Schema, Model } from "mongoose";
import { Payment as PaymentType } from "@/types/payment";

export interface IPayment extends PaymentType {
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["received", "sent"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    txHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

PaymentSchema.index({ userId: 1 }, { unique: true });
PaymentSchema.index({ txHash: 1 }, { unique: true });
PaymentSchema.index({ date: -1 });

export const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
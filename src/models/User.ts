import { WebAppUser } from "@/types/telegram";
import mongoose, { Schema, Model } from "mongoose";

export interface IUser extends WebAppUser {
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    id: {
      type: Number,
      required: true,
    },

    is_bot: {
      type: Boolean,
    },

    first_name: {
      type: String,
      required: true,
    },

    last_name: {
      type: String,
    },

    username: {
      type: String,
    },

    language_code: {
      type: String,
    },

    is_premium: {
      type: Boolean,
    },

    added_to_attachment_menu: {
      type: Boolean,
    },

    allows_write_to_pm: {
      type: Boolean,
    },

    photo_url: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.index({ id: 1 }, { unique: true });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

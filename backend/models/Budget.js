import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    category: { type: String, required: true },
    limit: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Budget = mongoose.model("budget", budgetSchema);

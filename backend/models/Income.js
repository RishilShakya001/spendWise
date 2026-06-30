import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    type: { type: String, default: "income" },
  },
  { timestamps: true },
);

export const Income = mongoose.model("income", incomeSchema);


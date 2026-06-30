import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    type: { type: String, enum: ["lent", "borrowed"], required: true },
    friendName: { type: String, required: true, trim: true },
    friendEmail: { type: String, trim: true },
    amount: { type: Number, required: true },
    description: { type: String, trim: true },
    isResolved: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Loan = mongoose.model("loan", loanSchema);

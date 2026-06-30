import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
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
    type: { type: String, default: "expense" },
    paymentMode: { type: String, enum: ["UPI", "Cash", "Card"], default: "UPI" },
    receiptUrl: { type: String, default: "" },
    isRecurring: { type: Boolean, default: false },
    splits: [
      {
        friendName: { type: String, trim: true },
        friendEmail: { type: String, trim: true },
        amount: { type: Number, required: true },
        paid: { type: Boolean, default: false },
      }
    ],
  },
  { timestamps: true },
);

export const Expense = mongoose.model("expense", expenseSchema);


import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, select: false }, // Not required for OAuth
    googleId: { type: String, unique: true, sparse: true },
    avatar: { type: String },
    collegeName: { type: String, default: "" },
    collegeYear: { type: String, default: "" },
    monthlyBudget: { type: Number, default: 10000 },
    categoryBudgets: { type: Map, of: Number, default: {} },
    savingsGoals: [
      {
        title: { type: String, required: true },
        targetAmount: { type: Number, required: true },
        currentAmount: { type: Number, default: 0 },
        deadline: { type: Date },
      }
    ],
  },
  { timestamps: true }
);

export const User = mongoose.model("user", userSchema);

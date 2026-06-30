import { Budget } from "../models/Budget.js";

export const getBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id });
    res.json(budgets);
  } catch (err) {
    next(err);
  }
};

export const setBudget = async (req, res, next) => {
  try {
    const { category, limit } = req.body;
    if (!category || limit === undefined) {
      return res.status(400).json({ message: "Category and limit are required" });
    }

    let budget = await Budget.findOne({ userId: req.user._id, category });
    if (budget) {
      budget.limit = Number(limit);
      await budget.save();
    } else {
      budget = new Budget({
        userId: req.user._id,
        category,
        limit: Number(limit),
      });
      await budget.save();
    }

    res.json(budget);
  } catch (err) {
    next(err);
  }
};

export const deleteBudget = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Budget.findOneAndDelete({ _id: id, userId: req.user._id });
    res.json({ success: true, message: "Budget limit cleared" });
  } catch (err) {
    next(err);
  }
};

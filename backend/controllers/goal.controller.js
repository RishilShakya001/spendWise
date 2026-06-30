import { Goal } from "../models/Goal.js";

export const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user._id });
    res.json(goals);
  } catch (err) {
    next(err);
  }
};

export const addGoal = async (req, res, next) => {
  try {
    const { title, targetAmount, deadline, currentAmount } = req.body;
    if (!title || !targetAmount) {
      return res.status(400).json({ message: "Title and target amount are required" });
    }

    const goal = new Goal({
      userId: req.user._id,
      title,
      targetAmount: Number(targetAmount),
      currentAmount: currentAmount ? Number(currentAmount) : 0,
      deadline: deadline ? new Date(deadline) : undefined,
    });

    await goal.save();
    res.json(goal);
  } catch (err) {
    next(err);
  }
};

export const contributeGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({ message: "Contribution amount is required" });
    }

    const goal = await Goal.findOne({ _id: id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    goal.currentAmount = Math.min(goal.targetAmount, goal.currentAmount + Number(amount));
    await goal.save();
    res.json(goal);
  } catch (err) {
    next(err);
  }
};

export const deleteGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Goal.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!deleted) {
      return res.status(404).json({ message: "Goal not found" });
    }
    res.json({ success: true, message: "Goal deleted" });
  } catch (err) {
    next(err);
  }
};

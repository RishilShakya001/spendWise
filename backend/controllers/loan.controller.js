import { Loan } from "../models/Loan.js";

export const getLoans = async (req, res, next) => {
  try {
    const loans = await Loan.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(loans);
  } catch (err) {
    next(err);
  }
};

export const addLoan = async (req, res, next) => {
  try {
    const { type, friendName, friendEmail, amount, description, date } = req.body;
    if (!type || !friendName || !amount) {
      return res.status(400).json({ message: "Type (lent/borrowed), Friend Name, and Amount are required" });
    }

    const loan = new Loan({
      userId: req.user._id,
      type,
      friendName,
      friendEmail,
      amount: Number(amount),
      description,
      date: date ? new Date(date) : undefined,
    });

    await loan.save();
    res.json(loan);
  } catch (err) {
    next(err);
  }
};

export const toggleResolveLoan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const loan = await Loan.findOne({ _id: id, userId: req.user._id });
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    loan.isResolved = !loan.isResolved;
    await loan.save();
    res.json(loan);
  } catch (err) {
    next(err);
  }
};

export const deleteLoan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Loan.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!deleted) {
      return res.status(404).json({ message: "Loan not found" });
    }
    res.json({ success: true, message: "Loan entry deleted" });
  } catch (err) {
    next(err);
  }
};

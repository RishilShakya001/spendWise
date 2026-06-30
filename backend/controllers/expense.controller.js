import { Expense } from "../models/Expense.js";
import getDateRange from "../utils/dateFilter.js";

export async function getExpense(req, res) {
  const userId = req.userId;
  const { startDate, endDate, category, paymentMode, search } = req.query || {};

  const query = { userId };

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  if (category && category !== "all" && category !== "undefined") {
    query.category = category;
  }

  if (paymentMode && paymentMode !== "all" && paymentMode !== "undefined") {
    query.paymentMode = paymentMode;
  }

  if (search) {
    query.$or = [
      { description: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];
  }

  const list = await Expense.find(query).sort({ date: -1, createdAt: -1 });
  res.json(list);
}

export async function addExpense(req, res) {
  const userId = req.userId;
  const { description, amount, category, date, paymentMode, receiptUrl, isRecurring, splits } = req.body || {};
  if (!description || amount == null || !category || !date) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const doc = await Expense.create({
    userId,
    description,
    amount: Number(amount),
    category,
    date: new Date(date),
    type: "expense",
    paymentMode: paymentMode || "UPI",
    receiptUrl: receiptUrl || "",
    isRecurring: !!isRecurring,
    splits: Array.isArray(splits) ? splits : [],
  });

  res.status(201).json(doc);
}

export async function updateExpense(req, res) {
  const userId = req.userId;
  const { id } = req.params;
  const { description, amount, category, date, paymentMode, receiptUrl, isRecurring, splits } = req.body || {};

  const updated = await Expense.findOneAndUpdate(
    { _id: id, userId },
    {
      ...(description != null ? { description } : {}),
      ...(amount != null ? { amount: Number(amount) } : {}),
      ...(category != null ? { category } : {}),
      ...(date != null ? { date: new Date(date) } : {}),
      ...(paymentMode != null ? { paymentMode } : {}),
      ...(receiptUrl != null ? { receiptUrl } : {}),
      ...(isRecurring != null ? { isRecurring: !!isRecurring } : {}),
      ...(splits != null ? { splits: Array.isArray(splits) ? splits : [] } : {}),
    },
    { new: true },
  );

  if (!updated) return res.status(404).json({ message: "Expense not found" });
  res.json(updated);
}

export async function deleteExpense(req, res) {
  const userId = req.userId;
  const { id } = req.params;
  const deleted = await Expense.findOneAndDelete({ _id: id, userId });
  if (!deleted) return res.status(404).json({ message: "Expense not found" });
  res.json({ success: true });
}

export async function toggleSplitPaid(req, res) {
  try {
    const userId = req.userId;
    const { id, splitId } = req.params;

    const expense = await Expense.findOne({ _id: id, userId });
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    const split = expense.splits.id(splitId);
    if (!split) return res.status(404).json({ message: "Split item not found" });

    split.paid = !split.paid;
    await expense.save();

    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function expenseOverview(req, res) {
  const userId = req.userId;
  const range = req.query.range || "monthly";
  const { start, end } = getDateRange(range);

  const expenses = await Expense.find({
    userId,
    date: { $gte: start, $lte: end },
  }).sort({ date: -1, createdAt: -1 });

  const totalExpense = expenses.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
  const averageExpense = expenses.length ? totalExpense / expenses.length : 0;
  const numberOfTransactions = expenses.length;
  const recentTransactions = expenses.slice(0, 9);

  res.json({
    success: true,
    data: {
      range,
      totalExpense,
      averageExpense,
      numberOfTransactions,
      recentTransactions,
    },
  });
}

export async function expenseDownload(req, res) {
  const userId = req.userId;
  const list = await Expense.find({ userId }).sort({ date: -1, createdAt: -1 });

  const rows = list.map((e) => ({
    Date: new Date(e.date).toISOString(),
    Description: e.description,
    Category: e.category,
    Amount: e.amount,
    Type: "Expense",
  }));

  const headers = ["Date", "Description", "Category", "Amount", "Type"];
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers
        .map((h) => {
          const v = r[h] ?? "";
          const s = String(v).replace(/"/g, '""');
          return /[",\n]/.test(s) ? `"${s}"` : s;
        })
        .join(","),
    ),
  ].join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="expense_details.csv"');
  res.send(csv);
}


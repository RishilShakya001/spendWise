import { Income } from "../models/Income.js";
import getDateRange from "../utils/dateFilter.js";

export async function getIncome(req, res) {
  const userId = req.userId;
  const list = await Income.find({ userId }).sort({ date: -1, createdAt: -1 });
  res.json(list);
}

export async function addIncome(req, res) {
  const userId = req.userId;
  const { description, amount, category, date } = req.body || {};
  if (!description || amount == null || !category || !date) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const doc = await Income.create({
    userId,
    description,
    amount: Number(amount),
    category,
    date: new Date(date),
    type: "income",
  });

  res.status(201).json(doc);
}

export async function updateIncome(req, res) {
  const userId = req.userId;
  const { id } = req.params;
  const { description, amount, category, date } = req.body || {};

  const updated = await Income.findOneAndUpdate(
    { _id: id, userId },
    {
      ...(description != null ? { description } : {}),
      ...(amount != null ? { amount: Number(amount) } : {}),
      ...(category != null ? { category } : {}),
      ...(date != null ? { date: new Date(date) } : {}),
    },
    { new: true },
  );

  if (!updated) return res.status(404).json({ message: "Income not found" });
  res.json(updated);
}

export async function deleteIncome(req, res) {
  const userId = req.userId;
  const { id } = req.params;
  const deleted = await Income.findOneAndDelete({ _id: id, userId });
  if (!deleted) return res.status(404).json({ message: "Income not found" });
  res.json({ success: true });
}

export async function incomeOverview(req, res) {
  const userId = req.userId;
  const range = req.query.range || "monthly";
  const { start, end } = getDateRange(range);

  const incomes = await Income.find({
    userId,
    date: { $gte: start, $lte: end },
  }).sort({ date: -1, createdAt: -1 });

  const totalIncome = incomes.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
  const averageIncome = incomes.length ? totalIncome / incomes.length : 0;
  const numberOfTransactions = incomes.length;
  const recentTransactions = incomes.slice(0, 9);

  res.json({
    success: true,
    data: {
      range,
      totalIncome,
      averageIncome,
      numberOfTransactions,
      recentTransactions,
    },
  });
}

export async function incomeDownload(req, res) {
  const userId = req.userId;
  const list = await Income.find({ userId }).sort({ date: -1, createdAt: -1 });

  const rows = list.map((i) => ({
    Date: new Date(i.date).toISOString(),
    Description: i.description,
    Category: i.category,
    Amount: i.amount,
    Type: "Income",
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
  res.setHeader("Content-Disposition", 'attachment; filename="income_details.csv"');
  res.send(csv);
}


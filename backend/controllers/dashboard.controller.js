import { Income } from "../models/Income.js";
import { Expense } from "../models/Expense.js";
import getDateRange from "../utils/dateFilter.js";

export async function dashboardOverview(req, res) {
  const userId = req.userId;
  const range = req.query.range || "monthly";
  const { start, end } = getDateRange(range);

  const [incomes, expenses] = await Promise.all([
    Income.find({ userId, date: { $gte: start, $lte: end } }),
    Expense.find({ userId, date: { $gte: start, $lte: end } }),
  ]);

  const monthlyIncome = incomes.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
  const monthlyExpense = expenses.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
  const savings = monthlyIncome - monthlyExpense;
  const savingsRate = monthlyIncome === 0 ? 0 : Math.round((savings / monthlyIncome) * 100);

  const recentTransactions = [
    ...incomes.map((i) => ({ ...i.toObject(), type: "income" })),
    ...expenses.map((e) => ({ ...e.toObject(), type: "expense" })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const spendByCategory = {};
  for (const exp of expenses) {
    const cat = exp.category || "Other";
    spendByCategory[cat] = (spendByCategory[cat] || 0) + Number(exp.amount || 0);
  }

  const expenseDistribution = Object.entries(spendByCategory).map(([category, amount]) => ({
    category,
    amount,
    percent: monthlyExpense === 0 ? 0 : Math.round((amount / monthlyExpense) * 100),
  }));

  res.json({
    success: true,
    data: {
      range,
      monthlyIncome,
      monthlyExpense,
      savings,
      savingsRate,
      spendByCategory,
      expenseDistribution,
      recentTransactions: recentTransactions.slice(0, 20),
    },
  });
}


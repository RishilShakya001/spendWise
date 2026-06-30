import { Expense } from "../models/Expense.js";
import { Income } from "../models/Income.js";
import { User } from "../models/User.js";

export async function getAIInsights(req, res) {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch last 30 days of expenses and incomes
    const startOf30DaysAgo = new Date();
    startOf30DaysAgo.setDate(startOf30DaysAgo.getDate() - 30);

    const [expenses, incomes] = await Promise.all([
      Expense.find({ userId, date: { $gte: startOf30DaysAgo } }),
      Income.find({ userId, date: { $gte: startOf30DaysAgo } }),
    ]);

    const totalSpent = expenses.reduce((acc, cur) => acc + Number(cur.amount), 0);
    const totalEarned = incomes.reduce((acc, cur) => acc + Number(cur.amount), 0);

    // Group expenses by category
    const categoryTotals = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
    });

    const budget = user.monthlyBudget || 10000;
    const overBudgetPercent = budget > 0 ? (totalSpent / budget) * 100 : 0;

    let insights = [];

    // Check if an external LLM key is configured (Gemini/Claude)
    const apiKey = process.env.GEMINI_API_KEY || process.env.CLAUDE_API_KEY;
    if (apiKey) {
      try {
        const prompt = `
          You are a friendly, witty, and highly practical AI Spending Coach for a college student named ${user.name}.
          Here is their financial summary for the last 30 days:
          - Monthly Budget: ₹${budget}
          - Total Spent: ₹${totalSpent} (which is ${overBudgetPercent.toFixed(1)}% of their budget)
          - Total Income (Pocket Money/Freelance/Scholarship): ₹${totalEarned}
          - Spending by Category: ${JSON.stringify(categoryTotals)}
          - Specific Transactions: ${JSON.stringify(
            expenses.slice(0, 10).map((e) => ({ desc: e.description, amt: e.amount, cat: e.category }))
          )}

          Provide 3 to 4 punchy, personalized, actionable insights formatted as bullet points.
          Make the advice highly targeted to college student life (canteen food, late-night snacking, stationery, online subscriptions, hostel fees, public transit).
          Avoid generic financial advice like "invest in mutual funds" or "buy a house".
          Return a raw JSON array of strings: ["insight 1", "insight 2", "insight 3"] and nothing else.
        `;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: "application/json" },
            }),
          }
        );

        if (response.ok) {
          const resData = await response.json();
          const text = resData.candidates?.[0]?.content?.parts?.[0]?.text;
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            insights = parsed;
          }
        }
      } catch (err) {
        console.error("Failed to fetch from LLM API, falling back to rule-based:", err);
      }
    }

    // Fallback/Rule-based high-fidelity insights
    if (insights.length === 0) {
      // Rule 1: Budget threshold check
      if (totalSpent > budget) {
        insights.push(
          `🚨 Alert: You have exceeded your monthly budget of ₹${budget} by ₹${(totalSpent - budget).toFixed(0)} (${(
            overBudgetPercent - 100
          ).toFixed(0)}% over). Consider putting non-essential purchases like dining out or subscriptions on hold.`
        );
      } else if (totalSpent > budget * 0.8) {
        insights.push(
          `⚠️ Warning: You've used ${overBudgetPercent.toFixed(
            0
          )}% of your monthly budget (₹${totalSpent} spent of ₹${budget}). You have ₹${(budget - totalSpent).toFixed(
            0
          )} remaining. Consider cutting down on eating out or gadgets for the next few days.`
        );
      } else {
        insights.push(
          `✅ Budget Status: Looking good! You have spent ${overBudgetPercent.toFixed(
            0
          )}% of your ₹${budget} budget. Keep this up and you will save ₹${(budget - totalSpent).toFixed(0)} this month.`
        );
      }

      // Rule 2: Top category check
      const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
      if (sortedCategories.length > 0) {
        const [topCat, topAmt] = sortedCategories[0];
        const pct = totalSpent > 0 ? (topAmt / totalSpent) * 100 : 0;
        insights.push(
          `🍔 Category Focus: You spent ₹${topAmt.toFixed(0)} on "${topCat}" (${pct.toFixed(
            0
          )}% of total spending). ${
            topCat.toLowerCase() === "food" || topCat.toLowerCase() === "mess / canteen"
              ? "College students often spend heavily on canteen/dining. Capping weekend outings could save you up to ₹1,500/month."
              : `Review your "${topCat}" purchases to see if you can share costs or cut back.`
          }`
        );
      }

      // Rule 3: Income/Savings check
      const netSavings = totalEarned - totalSpent;
      if (totalEarned > 0) {
        const savingsRate = (netSavings / totalEarned) * 100;
        if (savingsRate > 20) {
          insights.push(
            `💰 Savings Power: Your savings rate is ${savingsRate.toFixed(
              0
            )}% this month (net savings ₹${netSavings}). Excellent work! Put ₹${(netSavings * 0.5).toFixed(
              0
            )} into your active Savings Goal.`
          );
        } else if (savingsRate < 0) {
          insights.push(
            `💸 Pocket Squeeze: Your spending exceeds your pocket money/income by ₹${Math.abs(netSavings).toFixed(
              0
            )}. Try splitting roommate costs or tracking UPI transfers carefully.`
          );
        }
      } else {
        insights.push(
          `💡 Student Tip: No income logged yet. Try logging pocket money or part-time earnings to track your true net savings (Income - Expenses).`
        );
      }

      // Rule 4: Payment mode check
      const upiSpent = expenses
        .filter((e) => e.paymentMode === "UPI")
        .reduce((sum, e) => sum + Number(e.amount), 0);
      if (upiSpent > totalSpent * 0.7 && totalSpent > 0) {
        insights.push(
          `📱 UPI Warning: Over 70% of your purchases were made via UPI. UPI payments feel frictionless and can lead to micro-spending leaks. Try holding ₹500 in physical cash for small expenses.`
        );
      }
    }

    res.json({
      success: true,
      insights,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

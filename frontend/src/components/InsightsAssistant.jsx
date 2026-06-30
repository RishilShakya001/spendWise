import React, { useMemo } from "react";

const buildInsights = (transactions) => {
  if (!transactions?.length) {
    return ["Add some income and expenses to see personalized insights."];
  }

  const income = transactions.filter((t) => t.type === "income");
  const expense = transactions.filter((t) => t.type === "expense");

  const incomeTotal = income.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const expenseTotal = expense.reduce(
    (s, t) => s + (Number(t.amount) || 0),
    0,
  );
  const balance = incomeTotal - expenseTotal;

  const byCategory = expense.reduce((map, t) => {
    const key = t.category || "Other";
    map[key] = (map[key] || 0) + (Number(t.amount) || 0);
    return map;
  }, {});

  const topEntry = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  const insights = [];

  if (balance < 0) {
    insights.push(
      `You’re spending about ₹${Math.abs(balance).toFixed(
        0,
      )} more than your income this month. Skipping one party or a few late‑night orders could balance it.`,
    );
  } else if (balance > 0) {
    insights.push(
      `Nice work! You are saving roughly ₹${balance.toFixed(
        0,
      )}. Consider moving a fixed amount into savings each month.`,
    );
  }

  if (topEntry) {
    const [cat, amt] = topEntry;
    insights.push(
      `Your top spending category is ${cat} (~₹${amt.toFixed(
        0,
      )}). Try setting a weekly cap here that fits your allowance.`,
    );
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 30,
  );
  const sixtyDaysAgo = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 60,
  );

  const last30 = expense.filter(
    (t) => new Date(t.date) >= thirtyDaysAgo && new Date(t.date) <= now,
  );
  const prev30 = expense.filter(
    (t) =>
      new Date(t.date) >= sixtyDaysAgo &&
      new Date(t.date) < thirtyDaysAgo,
  );

  const last30Total = last30.reduce(
    (s, t) => s + (Number(t.amount) || 0),
    0,
  );
  const prev30Total = prev30.reduce(
    (s, t) => s + (Number(t.amount) || 0),
    0,
  );

  if (prev30Total > 0) {
    const diff = ((last30Total - prev30Total) / prev30Total) * 100;
    if (diff > 10) {
      insights.push(
        `Spending in the last 30 days is about ${diff.toFixed(
          0,
        )}% higher than the previous 30 days — consider a “low‑spend” week to recover.`,
      );
    } else if (diff < -10) {
      insights.push(
        `Nice! Your spending dropped about ${Math.abs(diff).toFixed(
          0,
        )}% vs the previous 30 days. Keep this pace to build an emergency fund.`,
      );
    }
  }

  return insights;
};

const InsightsAssistant = ({ transactions }) => {
  const insights = useMemo(
    () => buildInsights(transactions),
    [transactions],
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-white text-sm font-semibold">
          AI
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Smart spending coach
          </p>
          <p className="text-xs text-slate-500">
            Tips generated automatically from your recent activity.
          </p>
        </div>
      </div>

      <ul className="space-y-2 text-sm text-slate-700">
        {insights.map((line, idx) => (
          <li key={idx} className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InsightsAssistant;


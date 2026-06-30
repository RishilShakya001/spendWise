import express from "express";
import cors from "cors";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";

import { userScope } from "./middleware/userScope.js";
import incomeRoutes from "./routes/income.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import authRoutes from "./routes/auth.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import budgetRoutes from "./routes/budget.routes.js";
import goalRoutes from "./routes/goal.routes.js";
import loanRoutes from "./routes/loan.routes.js";

export function createApp() {
  const app = express();

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 150, // Limit each IP to 150 requests per windowMs
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "Too many requests from this IP, please try again after 15 minutes" },
  });

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
        if (isLocalhost || origin === process.env.FRONTEND_ORIGIN) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "5mb" })); // Increase limit to support base64 receipt uploads
  app.use(morgan("dev"));
  app.use("/api", limiter);

  app.get("/health", (_req, res) => res.json({ ok: true }));

  // Open routes
  app.use("/api/auth", authRoutes);

  // Protected routes require valid JWT tokens
  app.use("/api", userScope);

  app.use("/api/income", incomeRoutes);
  app.use("/api/expense", expenseRoutes);
  app.use("/api/expenses", expenseRoutes);
  app.use("/api/budget", budgetRoutes);
  app.use("/api/goals", goalRoutes);
  app.use("/api/loans", loanRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/summary", aiRoutes);

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  });

  return app;
}


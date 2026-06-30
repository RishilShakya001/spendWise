import { Router } from "express";
import {
  addExpense,
  deleteExpense,
  expenseDownload,
  expenseOverview,
  getExpense,
  updateExpense,
  toggleSplitPaid,
} from "../controllers/expense.controller.js";

const router = Router();

router.get("/get", getExpense);
router.post("/add", addExpense);
router.put("/update/:id", updateExpense);
router.delete("/delete/:id", deleteExpense);
router.get("/overview", expenseOverview);
router.get("/downloadexcel", expenseDownload);
router.put("/splits/:id/toggle/:splitId", toggleSplitPaid);

export default router;


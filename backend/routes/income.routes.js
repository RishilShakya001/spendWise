import { Router } from "express";
import {
  addIncome,
  deleteIncome,
  getIncome,
  incomeDownload,
  incomeOverview,
  updateIncome,
} from "../controllers/income.controller.js";

const router = Router();

router.get("/get", getIncome);
router.post("/add", addIncome);
router.put("/update/:id", updateIncome);
router.delete("/delete/:id", deleteIncome);
router.get("/overview", incomeOverview);
router.get("/downloadexcel", incomeDownload);

export default router;


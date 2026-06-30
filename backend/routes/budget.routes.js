import express from "express";
import { getBudgets, setBudget, deleteBudget } from "../controllers/budget.controller.js";

const router = express.Router();
router.get("/", getBudgets);
router.post("/set", setBudget);
router.delete("/:id", deleteBudget);

export default router;

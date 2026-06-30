import express from "express";
import { getLoans, addLoan, toggleResolveLoan, deleteLoan } from "../controllers/loan.controller.js";

const router = express.Router();
router.get("/", getLoans);
router.post("/add", addLoan);
router.put("/resolve/:id", toggleResolveLoan);
router.delete("/:id", deleteLoan);

export default router;

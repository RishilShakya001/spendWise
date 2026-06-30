import express from "express";
import { getGoals, addGoal, contributeGoal, deleteGoal } from "../controllers/goal.controller.js";

const router = express.Router();
router.get("/", getGoals);
router.post("/add", addGoal);
router.put("/contribute/:id", contributeGoal);
router.delete("/:id", deleteGoal);

export default router;

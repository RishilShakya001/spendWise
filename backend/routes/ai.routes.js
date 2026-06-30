import express from "express";
import { getAIInsights } from "../controllers/ai.controller.js";
import { userScope } from "../middleware/userScope.js";

const router = express.Router();

router.get("/insights", userScope, getAIInsights);

export default router;

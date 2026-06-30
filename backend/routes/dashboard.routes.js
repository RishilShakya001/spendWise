import { Router } from "express";
import { dashboardOverview } from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/overview", dashboardOverview);

export default router;


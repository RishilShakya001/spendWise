import express from "express";
import { register, login, googleLogin, getProfile, updateProfile } from "../controllers/auth.controller.js";
import { userScope } from "../middleware/userScope.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);

// Protected routes
router.get("/profile", userScope, getProfile);
router.put("/profile", userScope, updateProfile);

export default router;

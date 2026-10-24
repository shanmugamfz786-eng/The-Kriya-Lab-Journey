import { Router } from "express";
import { register, login, me, createEnquiry, changePassword, forgotPassword } from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", register);
router.post("/register", register);
router.post("/login", login);
router.get("/me", me);
router.post("/enquiry", createEnquiry);
router.post("/change-password", changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", forgotPassword);

export default router;

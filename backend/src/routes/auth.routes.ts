import { Router } from "express";
import {
  register,
  login,
  me,
  createEnquiry,
  changePassword,
  forgotPassword,
  detectCountry,
  preVerifyLocation,
} from "../controllers/auth.controller.js";
import { registrationRateLimiter } from "../middleware/rate-limiter.js";

const router = Router();

router.get("/detect-country", detectCountry);
router.post("/verify-location", registrationRateLimiter(), preVerifyLocation);
router.post("/signup", registrationRateLimiter(), register);
router.post("/register", registrationRateLimiter(), register);
router.post("/login", login);
router.get("/me", me);
router.post("/enquiry", createEnquiry);
router.post("/change-password", changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", forgotPassword);

export default router;

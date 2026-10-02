import { Router } from "express";
import { register, login, me, createEnquiry } from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", register);
router.post("/register", register);
router.post("/login", login);
router.get("/me", me);
router.post("/enquiry", createEnquiry);

export default router;

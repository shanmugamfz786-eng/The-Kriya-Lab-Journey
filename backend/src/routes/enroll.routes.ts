import express from "express";
import { enrollInProgram, getUserEnrollments } from "../controllers/enroll.controller.js";

const router = express.Router();

router.post("/", enrollInProgram);
router.get("/:userId", getUserEnrollments);

export default router;

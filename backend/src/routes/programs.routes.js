import { Router } from "express";
import { getPrograms, createProgram, updateProgram, deleteProgram } from "../controllers/programs.controller.js";

const router = Router();

// GET /api/programs
// Supports ?type=online|offline
router.get("/", getPrograms);

// POST /api/programs
router.post("/", createProgram);

// PUT /api/programs/:id
router.put("/:id", updateProgram);

// DELETE /api/programs/:id
router.delete("/:id", deleteProgram);

export default router;

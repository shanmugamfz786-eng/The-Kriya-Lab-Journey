import { Router } from "express";
import { getUsers, deleteUser } from "../controllers/users.controller.js";

const router = Router();

// Routes
router.get("/", getUsers);
router.delete("/:id", deleteUser);

export default router;

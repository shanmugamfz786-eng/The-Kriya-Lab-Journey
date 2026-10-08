import { Router } from "express";
import { getUsers, deleteUser, updateUser } from "../controllers/users.controller.js";

const router = Router();

// Routes
router.get("/", getUsers);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;

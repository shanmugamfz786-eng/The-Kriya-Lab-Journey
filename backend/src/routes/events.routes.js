import { Router } from "express";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventImage,
} from "../controllers/events.controller.js";

const router = Router();

// Routes
router.get("/", getEvents);
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);
router.post("/upload-image", uploadEventImage);

export default router;

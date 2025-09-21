import express, { Router } from "express";
import {
  createPriortity,
  deletePriority,
} from "../controllers/Priority.controller.js";
import { authenticateToken } from "../utils/jwt.js";

const router: Router = express.Router();

router.use(authenticateToken);

router.post("/create", createPriortity);
router.delete("/delete/:id", deletePriority);

export default router;

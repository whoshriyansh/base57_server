import express, { Router } from "express";
import {
  createCategory,
  deleteCategory,
} from "../controllers/Category.controller.js";
import { authenticateToken } from "../utils/jwt.js";

const router: Router = express.Router();

router.use(authenticateToken);

router.post("/create", createCategory);
router.delete("/delete/:id", deleteCategory);

export default router;

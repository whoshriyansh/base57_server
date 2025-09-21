import express, { Router } from "express";
import {
  addTaskCategory,
  createTask,
  deleteCategory,
  deleteTaskById,
  editTaskById,
  getAllTask,
  getTaskById,
} from "../controllers/Task.controller.js";
import { authenticateToken } from "../utils/jwt.js";

const router: Router = express.Router();

router.use(authenticateToken);

router.post("/create", createTask);
router.patch("/edit/:id", editTaskById);
router.get("/all", getAllTask);
router.get("/getSingle/:id", getTaskById);
router.delete("/delete/:id", deleteTaskById);

router.post("/addCategory", addTaskCategory);
router.delete("/deleteCategory", deleteCategory);

export default router;

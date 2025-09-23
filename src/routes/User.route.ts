// routes/user.route.ts (new file)
import express, { Router } from "express";
import { updateUser, deleteUser } from "../controllers/User.controller.js"; // Assuming extended from the file with register/login
import { authenticateToken } from "../utils/jwt.js";

const router: Router = express.Router();

router.use(authenticateToken);

router.patch("/update", updateUser);
router.delete("/delete", deleteUser);

export default router;

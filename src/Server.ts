import express from "express";
import dotenv from "dotenv";

import { ConnectDB } from "./db/ConnectDB.js";
import authRoutes from "./routes/Auth.route.js";
import taskRoutes from "./routes/Task.route.js";
import categoryRoutes from "./routes/Category.route.js";
import priorityRoutes from "./routes/Priority.route.js";
import useroutes from "./routes/User.route.js";

dotenv.config();
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello From the server");
});

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use("/auth", authRoutes);
app.use("/task", taskRoutes);
app.use("/category", categoryRoutes);
app.use("/priority", priorityRoutes);
app.use("/user", useroutes);

app.listen(process.env.PORT || 3000, () => {
  ConnectDB();
  console.log(`The app is running on PORT: ${process.env.PORT || 3000}`);
});

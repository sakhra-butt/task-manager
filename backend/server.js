import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // Add CORS
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

import { protect } from "./middleware/authMiddleware.js";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const app = express();

//  Enable CORS for frontend (e.g. Vite on http://localhost:5173)
app.use(
  cors({
    origin: "https://sak-task-manager.netlify.app", //  frontend origin
    credentials: false, 
  })
);

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", protect, taskRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));

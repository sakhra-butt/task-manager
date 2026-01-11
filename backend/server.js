import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { protect } from "./middleware/authMiddleware.js";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const app = express();

// Allow both Netlify frontend and local development
const allowedOrigins = [
  "https://sak-task-manager.netlify.app", // production
  "http://localhost:5173",               // local dev
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser tools like Postman
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS not allowed for this origin"));
    }
  },
  credentials: true, // enable if you use cookies (JWT in header is fine either way)
}));

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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

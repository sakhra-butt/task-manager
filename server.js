// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load .env variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const protectedRoute = require("./routes/protectedRoute");
const taskRoutes = require("./routes/taskRoutes");
app.use("/api/tasks", taskRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoute);

// Default route (optional)
// app.get("/", (req, res) => {
//   res.send("API is running...");
// });

// Server port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

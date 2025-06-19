// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Load Sequelize models
const db = require("./models");

// Sync all defined models to the DB (auto-create missing tables)
db.sequelize.sync({ alter: true }).then(() => {
  console.log("✅ All models synced with database");
}).catch((err) => {
  console.error("❌ Sequelize sync error:", err);
});

// Middleware
app.use(cors({
  origin: 'https://ai-tutor-project.netlify.app',
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/chat", require("./routes/chat"));
app.use("/api/account", require("./routes/account"));
app.use("/api/quiz", require("./routes/quiz"));
app.use("/api/session", require("./routes/session"));
app.use("/api/auth", require("./routes/auth"));

// Health check
app.get("/", (req, res) => {
  res.send("AI Tutor API is running 🚀");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

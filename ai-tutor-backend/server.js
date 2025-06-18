// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/chat", require("./routes/chat"));
app.use("/api/account", require("./routes/account"));
const chatRoutes = require('./routes/chat');
app.use('/api/chat', chatRoutes);

const quizRoutes = require('./routes/quiz');
app.use('/api/quiz', quizRoutes);
const sessionRoutes = require('./routes/session');
app.use('/api/session', sessionRoutes);



// Routes
app.use("/api/auth", require("./routes/auth"));

app.get("/", (req, res) => {
  res.send("AI Tutor API is running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const express = require("express");
const router = express.Router();
const { ChatMessage, ChatSessionSummary } = require("../models");
const authenticate = require("../middleware/auth");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// POST: Generate + Save Session Summary
router.post("/save", authenticate, async (req, res) => {
  const { subject } = req.body;

  try {
    const messages = await ChatMessage.findAll({
      where: { userId: req.user.id, subject },
      order: [['createdAt', 'ASC']],
      limit: 15, // You can adjust based on context size
    });

    const conversation = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const summaryPrompt = [
      { role: "system", content: "You are a helpful tutor that summarizes learning sessions." },
      ...conversation,
      { role: "user", content: "Summarize this session in 3-4 sentences." }
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI Tutor App"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: summaryPrompt
      }),
    });

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content;

    if (!summary) {
      return res.status(500).json({ error: "Failed to generate summary" });
    }

    const saved = await ChatSessionSummary.create({
      userId: req.user.id,
      subject,
      summary
    });

    res.json(saved);
  } catch (err) {
    console.error("Summary error:", err.message);
    res.status(500).json({ error: "Could not save summary" });
  }
});

// GET: Fetch session summaries
router.get("/history", authenticate, async (req, res) => {
  try {
    const summaries = await ChatSessionSummary.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    res.json(summaries);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch summaries" });
  }
});

module.exports = router;

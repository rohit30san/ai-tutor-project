const express = require("express");
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { ChatMessage, User } = require("../models");
const authenticate = require("../middleware/auth"); // your JWT middleware

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// POST: Get AI reply + save both user + AI message
router.post("/", authenticate, async (req, res) => {
  try {
    const userMessage = req.body.message;
    const subject = req.body.subject || 'General';
    const userId = req.user.id;

    // Save user message
    await ChatMessage.create({
      userId,
      role: 'user',
      content: userMessage,
      subject,
    });

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
        messages: [
          { role: "system", content: "You are a helpful AI tutor." },
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await response.json();
    const aiReply = data.choices?.[0]?.message?.content;

    if (!aiReply) return res.status(500).json({ error: "No AI reply", raw: data });

    // Save AI message
    await ChatMessage.create({
      userId,
      role: 'ai',
      content: aiReply,
      subject,
    });

    res.json({ reply: aiReply });
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: "Backend exception", message: err.message });
  }
});

// GET: Recent subjects (for dashboard)
router.get("/history", authenticate, async (req, res) => {
  try {
    const messages = await ChatMessage.findAll({
      where: { userId: req.user.id, role: 'user' },
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    const recentSubjects = [...new Set(messages.map(msg => msg.subject || 'General'))];
    res.json(recentSubjects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

module.exports = router;

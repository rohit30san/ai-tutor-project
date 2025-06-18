const express = require("express");
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { QuizResult } = require("../models");
const authenticate = require("../middleware/auth");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// GET: Generate quiz questions
router.get("/", authenticate, async (req, res) => {
  const subject = req.query.subject || "General Knowledge";

  const prompt = `Generate 3 multiple choice questions on the topic "${subject}".
Each question should have:
- a "question"
- 4 "options"
- and the correct "answer"
Format the entire response as a JSON array.`;

  try {
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
          { role: "system", content: "You are a helpful quiz generator AI." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();
    const aiReply = data.choices?.[0]?.message?.content;
    const questions = JSON.parse(aiReply);

    res.json({ questions });
  } catch (err) {
    console.error("Quiz generation error:", err.message);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

// POST: Save quiz result
router.post("/submit", authenticate, async (req, res) => {
  const { subject, score, totalQuestions } = req.body;

  try {
    const result = await QuizResult.create({
      userId: req.user.id,
      subject,
      score,
      totalQuestions,
    });

    res.json(result);
  } catch (err) {
    console.error("Quiz save error:", err.message);
    res.status(500).json({ error: "Failed to save quiz result" });
  }
});

// ✅ GET: Quiz history for dashboard/account
router.get("/history", authenticate, async (req, res) => {
  try {
    const results = await QuizResult.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    res.json(results);
  } catch (err) {
    console.error("Quiz history fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch quiz history" });
  }
});

module.exports = router;

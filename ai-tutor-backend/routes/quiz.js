const express = require("express");
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { QuizResult } = require("../models");
const authenticate = require("../middleware/auth");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// GET: Generate quiz questions
router.get("/", authenticate, async (req, res) => {
  const subject = req.query.subject || "General Knowledge";

  const prompt = `You are an AI that generates only JSON.

Generate 3 multiple choice questions about "${subject}" in this exact format:
[
  {
    "question": "What is the capital of France?",
    "options": ["Berlin", "London", "Paris", "Rome"],
    "answer": "Paris"
  },
  ...
]

No explanation. Only return the array.`;

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

    if (!aiReply) {
      console.error("AI reply was undefined or empty");
      return res.status(500).json({ error: "AI did not return quiz content." });
    }

    let questions;
    try {
      const jsonStart = aiReply.indexOf("[");
      const jsonEnd = aiReply.lastIndexOf("]");
      const jsonString = aiReply.slice(jsonStart, jsonEnd + 1);
      questions = JSON.parse(jsonString);
    } catch (parseErr) {
      console.error("Failed to parse AI quiz reply:", aiReply);
      return res.status(500).json({ error: "Invalid quiz format from AI", raw: aiReply });
    }

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

// GET: Quiz history for dashboard/account
router.get("/history", authenticate, async (req, res) => {
  try {
    const results = await QuizResult.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    res.json(results);
  } catch (err) {
    console.error("Quiz history fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch quiz history" });
  }
});

// POST: Explain quiz answers
router.post("/explain", authenticate, async (req, res) => {
  const { questions } = req.body;

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: "No quiz data provided" });
  }

  const prompt = `Explain the correct answers for the following multiple choice questions:\n\n${JSON.stringify(questions, null, 2)}\n\nGive a clear explanation per question for a student to understand.`;

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
          { role: "system", content: "You are a helpful tutor explaining quiz answers." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content;

    if (!explanation) {
      return res.status(500).json({ error: "AI did not return an explanation" });
    }

    res.json({ explanation });
  } catch (err) {
    console.error("Quiz explanation error:", err.message);
    res.status(500).json({ error: "Failed to generate explanation" });
  }
});

module.exports = router;

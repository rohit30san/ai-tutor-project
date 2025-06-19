const express = require("express");
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { ChatMessage } = require("../models");
const authenticate = require("../middleware/auth");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// POST: Get AI reply + save both user + AI message
router.post("/", authenticate, async (req, res) => {
  try {
    const userMessage = req.body.message;
    const subject = req.body.subject || 'General';
    const personality = req.body.personality || 'coach';
    const userId = req.user.id;

    if (!userMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Save user message
    await ChatMessage.create({
      userId,
      role: 'user',
      content: userMessage,
      subject,
    });

    // Fetch last 5 messages (same subject)
    const recentMessages = await ChatMessage.findAll({
      where: { userId, subject },
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    const context = recentMessages.reverse().map(msg => ({
      role: msg.role === 'ai' ? 'assistant' : 'user',
      content: msg.content
    }));

    // ✅ Generate system prompt based on personality
    let systemPrompt = "You are a helpful AI tutor.";
    if (personality === 'strict') {
      systemPrompt = "You are a strict AI tutor. Be formal and direct while correcting mistakes.";
    } else if (personality === 'chill') {
      systemPrompt = "You are a chill, friendly AI tutor. Keep responses casual and supportive.";
    } else if (personality === 'coach') {
      systemPrompt = "You are a supportive AI tutor helping students understand topics clearly.";
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...context,
      { role: "user", content: userMessage }
    ];

    // ✅ Fetch reply from OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ai-tutor-project.netlify.app", // optional but preferred
        "X-Title": "AI Tutor App"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages
      })
    });

    const data = await response.json();

    const aiReply = data.choices?.[0]?.message?.content;

    if (!aiReply) {
      console.error("Invalid AI response:", JSON.stringify(data));
      return res.status(500).json({ error: "AI did not return a response", raw: data });
    }

    // ✅ Save AI reply
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

// GET: Last 5 messages for context
router.get("/context", authenticate, async (req, res) => {
  const subject = req.query.subject || 'General';

  try {
    const messages = await ChatMessage.findAll({
      where: { userId: req.user.id, subject },
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    const formatted = messages.reverse().map(msg => ({
      sender: msg.role === 'ai' ? 'received' : 'sent',
      text: msg.content
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Failed to load chat context:", err.message);
    res.status(500).json({ error: "Failed to load chat history" });
  }
});

module.exports = router;

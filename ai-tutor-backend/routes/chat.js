const express = require("express");
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));


const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

router.post("/", async (req, res) => {
  try {
    const userMessage = req.body.message;
    console.log("User asked:", userMessage);

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
    console.log("Raw API response from OpenRouter:", JSON.stringify(data, null, 2));

    if (data.choices && data.choices.length > 0) {
      res.json({ reply: data.choices[0].message.content });
    } else {
      res.status(500).json({ error: "No AI reply", raw: data });
    }
  } catch (err) {
    console.error("Chat error:", err.message, err.stack);
    res.status(500).json({ error: "Backend exception", message: err.message });
  }
});

module.exports = router;

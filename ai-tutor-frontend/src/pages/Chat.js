import React, { useEffect, useState } from 'react';
import '../styles/chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([
    { text: 'Hi, how can I help you today?', sender: 'received' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('General');
  const [personality, setPersonality] = useState('coach');

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
    }

    const params = new URLSearchParams(window.location.search);
    const subjectFromURL = params.get("subject");
    if (subjectFromURL) {
      setSubject(subjectFromURL);
    }
  }, []);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const updatedMessages = [...messages, { text: trimmed, sender: 'sent' }];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("https://ai-tutor-project.onrender.com/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          message: trimmed,
          subject,
          personality
        }),
      });

      const data = await res.json();
      setMessages([...updatedMessages, { text: data.reply, sender: 'received' }]);
    } catch (err) {
      setMessages([...updatedMessages, { text: "Error: No response from AI", sender: 'received' }]);
    }

    setLoading(false);
  };

  const handleGenerateSummary = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("https://ai-tutor-project.onrender.com/api/session/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ subject })
      });

      const data = await res.json();
      alert("Session summary saved!");
    } catch (err) {
      console.error("Summary generation failed:", err);
      alert("Failed to generate summary.");
    }
  };

  return (
    <div className="chat-wrapper">
      {/* Stylish Personality Dropdown */}
      <div className="chat-mode-selector">
        <label>Tutor Mode</label>
        <select value={personality} onChange={(e) => setPersonality(e.target.value)}>
          <option value="coach">🧠 Coach</option>
          <option value="strict">👨‍🏫 Strict</option>
          <option value="chill">😎 Chill</option>
        </select>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="message received loading">AI is typing...</div>
        )}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>

      <div style={{ marginTop: '12px', textAlign: 'right' }}>
        <button
          onClick={handleGenerateSummary}
          style={{
            padding: '8px 14px',
            background: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Save Session Summary
        </button>
      </div>
    </div>
  );
};

export default Chat;

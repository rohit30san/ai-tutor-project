import React, { useEffect, useState } from 'react';
import '../styles/chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([
    { text: 'Hi, how can I help you today?', sender: 'received' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
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
      const res = await fetch("https://ai-tutor-project.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json();
      setMessages([...updatedMessages, { text: data.reply, sender: 'received' }]);
    } catch (err) {
      setMessages([...updatedMessages, { text: "Error: No response from AI", sender: 'received' }]);
    }

    setLoading(false);
  };

  return (
    <div className="chat-wrapper">
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
    </div>
  );
};

export default Chat;

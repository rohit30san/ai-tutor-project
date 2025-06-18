import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [topics, setTopics] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [summaries, setSummaries] = useState([]);

  useEffect(() => {
    const fetchSummaries = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("https://ai-tutor-project.onrender.com/api/session/history", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        console.log("Summaries data:", data);
        setSummaries(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch session summaries", error);
        setSummaries([]);
      }
    };
    fetchSummaries();
  }, []);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(storedUser);

    const token = localStorage.getItem('token');

    const fetchTopics = async () => {
      try {
        const res = await fetch('https://ai-tutor-project.onrender.com/api/chat/history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log("Topics data:", data);
        // Adjust this if API returns object with array inside, e.g. data.topics
        setTopics(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch recent topics', err);
        setTopics([]);
      }
    };

    const fetchHistory = async () => {
      try {
        const res = await fetch('https://ai-tutor-project.onrender.com/api/quiz/history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log("Quiz history data:", data);
        setQuizHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch quiz history", err);
        setQuizHistory([]);
      }
    };

    fetchTopics();
    fetchHistory();
  }, [navigate]);

  const subjects = ['Math', 'Science', 'Coding', 'English'];

  const handleSubjectClick = (subject) => {
    navigate(`/chat?subject=${subject}`);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2 className="dashboard-title">Welcome back, {user?.name || 'Student'} 👋</h2>
        <p className="dashboard-subtitle">Choose a subject to start learning:</p>

        <div className="subject-grid">
          {subjects.map((sub) => (
            <div key={sub} className="subject-box">
              <div onClick={() => handleSubjectClick(sub)} style={{ cursor: 'pointer' }}>
                {sub}
              </div>
              <button
                style={{
                  marginTop: '10px',
                  padding: '6px 12px',
                  fontSize: '0.9rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#007bff',
                  color: 'white',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/quiz?subject=${sub}`)}
              >
                Take Quiz
              </button>
            </div>
          ))}
        </div>

        <section className="recent-topics">
          <h3>🕓 Recent Topics</h3>
          <ul>
            {Array.isArray(topics) && topics.length > 0 ? (
              topics.map((topic, idx) => <li key={idx}>{topic}</li>)
            ) : (
              <li>No recent topics yet.</li>
            )}
          </ul>
        </section>

        <section className="quiz-history">
          <h3>📝 Recent Quiz History</h3>
          {Array.isArray(quizHistory) && quizHistory.length > 0 ? (
            <ul>
              {quizHistory.map((q, i) => (
                <li key={i}>
                  {q.subject} — {q.score}/{q.totalQuestions} (
                  {new Date(q.createdAt).toLocaleDateString()})
                </li>
              ))}
            </ul>
          ) : (
            <p>No quiz attempts yet.</p>
          )}
        </section>

        <section className="session-summaries">
          <h3>🧠 Session Summaries</h3>
          {Array.isArray(summaries) && summaries.length > 0 ? (
            <ul>
              {summaries.map((s, i) => (
                <li key={i}>
                  <strong>{s.subject}</strong> — {new Date(s.createdAt).toLocaleDateString()}
                  <p>{s.summary}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No summaries yet.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

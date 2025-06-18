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
      const res = await fetch("https://ai-tutor-project.onrender.com/api/session/history", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSummaries(data);
    };
    fetchSummaries();
  }, []);


  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(storedUser);
    }

    const token = localStorage.getItem('token');

    const fetchTopics = async () => {
      try {
        const res = await fetch('https://ai-tutor-project.onrender.com/api/chat/history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setTopics(data);
      } catch (err) {
        console.error('Failed to fetch recent topics');
      }
    };

    const fetchHistory = async () => {
      try {
        const res = await fetch('https://ai-tutor-project.onrender.com/api/quiz/history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setQuizHistory(data);
      } catch (err) {
        console.error("Failed to fetch quiz history");
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
            {topics.length === 0 ? (
              <li>No recent topics yet.</li>
            ) : (
              topics.map((topic, idx) => <li key={idx}>{topic}</li>)
            )}
          </ul>
        </section>

        <section className="quiz-history">
          <h3>📝 Recent Quiz History</h3>
          {quizHistory.length === 0 ? (
            <p>No quiz attempts yet.</p>
          ) : (
            <ul>
              {quizHistory.map((q, i) => (
                <li key={i}>
                  {q.subject} — {q.score}/{q.totalQuestions} (
                  {new Date(q.createdAt).toLocaleDateString()})
                </li>
              ))}
            </ul>
          )}
        </section>
	
	<section className="session-summaries">
 	  <h3>🧠 Session Summaries</h3>
  	  {summaries.length === 0 ? (
    	    <p>No summaries yet.</p>
  	  ) : (
    	    <ul>
      	      {summaries.map((s, i) => (
        	<li key={i}>
          	  <strong>{s.subject}</strong> — {new Date(s.createdAt).toLocaleDateString()}
          	  <p>{s.summary}</p>
        	</li>
      	      ))}
    	    </ul>
  	  )}
	</section>


      </div>
    </div>
  );
};

export default Dashboard;

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './quiz.css';

const Quiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState('');
  const [userAnswers, setUserAnswers] = useState([]); // NEW
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState(''); // NEW

  const subject = new URLSearchParams(location.search).get("subject") || "General";

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`https://ai-tutor-project.onrender.com/api/quiz?subject=${subject}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setQuestions(data.questions || []);
      } catch (err) {
        alert("Failed to load quiz");
      }
    };
    fetchQuiz();
  }, [subject]);

  const handleSubmit = async () => {
    const isCorrect = selected === questions[current].answer;
    const newScore = isCorrect ? score + 1 : score;

    setUserAnswers([
      ...userAnswers,
      { ...questions[current], userSelected: selected } // NEW
    ]);

    if (current + 1 < questions.length) {
      setScore(newScore);
      setCurrent(current + 1);
      setSelected('');
    } else {
      setScore(newScore);
      setFinished(true);
      setLoading(true);

      try {
        const token = localStorage.getItem("token");
        await fetch("https://ai-tutor-project.onrender.com/api/quiz/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subject,
            score: newScore,
            totalQuestions: questions.length,
          }),
        });
      } catch (err) {
        console.error("Quiz result not saved:", err);
      }

      setLoading(false);
    }
  };

  const handleExplain = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://ai-tutor-project.onrender.com/api/quiz/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ questions: userAnswers })
      });

      const data = await res.json();
      setExplanation(data.explanation || "No explanation received.");
    } catch (err) {
      console.error("Explanation fetch failed:", err);
      alert("Failed to fetch explanation.");
    }
  };

  return (
    <div className="quiz-wrapper">
      {!finished ? (
        <>
          <h2>{subject} Quiz</h2>
          {questions.length > 0 && (
            <>
              <p><strong>Q{current + 1}:</strong> {questions[current].question}</p>
              <ul className="quiz-options">
                {questions[current].options.map((opt, i) => (
                  <li key={i}>
                    <label>
                      <input
                        type="radio"
                        name="option"
                        value={opt}
                        checked={selected === opt}
                        onChange={(e) => setSelected(e.target.value)}
                      />
                      {opt}
                    </label>
                  </li>
                ))}
              </ul>
              <button disabled={!selected} onClick={handleSubmit}>
                {current === questions.length - 1 ? 'Finish Quiz' : 'Next'}
              </button>
            </>
          )}
        </>
      ) : (
        <div className="quiz-result">
          <h2>Quiz Completed!</h2>
          <p>Your Score: {score} / {questions.length}</p>
          {loading && <p>Saving your score...</p>}

          <h3>Review Answers:</h3>
          <ul>
            {userAnswers.map((q, idx) => (
              <li key={idx} style={{ marginBottom: "10px" }}>
                <strong>Q{idx + 1}:</strong> {q.question}<br />
                ✅ Correct: <strong>{q.answer}</strong><br />
                {q.userSelected === q.answer ? (
                  <span style={{ color: "green" }}>You chose correctly</span>
                ) : (
                  <span style={{ color: "red" }}>
                    You selected: <strong>{q.userSelected || "None"}</strong>
                  </span>
                )}
              </li>
            ))}
          </ul>

          <button onClick={handleExplain} style={{ marginTop: '1rem' }}>
            Explain this quiz
          </button>

          {explanation && (
            <div style={{ marginTop: "1rem", background: "#f5f5f5", padding: "1rem", borderRadius: "8px" }}>
              <h4>🧠 Explanation:</h4>
              <p style={{ whiteSpace: "pre-wrap" }}>{explanation}</p>
            </div>
          )}

          <button onClick={() => navigate('/dashboard')} style={{ marginTop: "1rem" }}>
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;

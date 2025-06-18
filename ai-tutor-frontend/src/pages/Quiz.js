import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './quiz.css';

const Quiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState('');
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);

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
          <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      )}
    </div>
  );
};

export default Quiz;

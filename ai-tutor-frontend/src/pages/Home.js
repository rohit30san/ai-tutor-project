import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';
import heroImg from '../assets/tutor_hero.svg';

const Home = () => {
  return (
    <div className="home-wrapper">

      {/* 🎯 HERO SECTION */}
      <div className="hero-section">
        <div className="hero-text">
          <h1>Learn Smarter with <span>TutorAI</span></h1>
          <p>Your personal AI-powered tutor — helping you 24/7 with learning, doubt-solving, quizzes, and more.</p>
          <div className="hero-buttons">
            <Link to="/register" className="btn">Get Started</Link>
            <Link to="/login" className="btn btn-outline">Login</Link>
          </div>
        </div>
        <div className="hero-image">
          <img src={heroImg} alt="TutorAI illustration" />
        </div>
      </div>

      {/* 🧩 FEATURES */}
      <section className="features-section">
        <h2>✨ Why Students Love TutorAI</h2>
        <div className="feature-grid">
          <div className="feature-card">
            💬 <h3>Smart AI Chat</h3>
            <p>Ask any question — TutorAI explains it instantly like a human teacher.</p>
          </div>
          <div className="feature-card">
            🧪 <h3>AI Quizzes</h3>
            <p>Take topic-based quizzes generated by AI to test yourself daily.</p>
          </div>
          <div className="feature-card">
            🧠 <h3>Session Summaries</h3>
            <p>Review important takeaways and stay on track with smart AI summaries.</p>
          </div>
          <div className="feature-card">
            📚 <h3>Subjects You Love</h3>
            <p>Switch between Math, Science, Coding, English and more anytime.</p>
          </div>
        </div>
      </section>

      {/* 🛠 HOW IT WORKS */}
      <section className="how-section">
        <h2>🛠 How TutorAI Works</h2>
        <ol>
          <li>Sign up or log in</li>
          <li>Select a subject or start chatting</li>
          <li>Ask doubts or take quizzes</li>
          <li>Save and review AI-generated summaries</li>
        </ol>
      </section>

      {/* 🚀 FINAL CTA */}
      <section className="cta-section">
        <h2>🚀 Ready to Learn Smarter?</h2>
        <p>Start your journey with TutorAI — free, forever.</p>
        <Link to="/register" className="btn">Join Now</Link>
      </section>
    </div>
  );
};

export default Home;

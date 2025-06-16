import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';
import heroImg from '../assets/tutor_hero.svg';

const Home = () => {
  return (
    <div className="home-wrapper">
      <div className="hero-section">
        <div className="hero-text">
          <h1>Learn Smarter with <span>TutorAI</span></h1>
          <p>Your personal AI-powered tutor — helping you 24/7 with learning, doubt-solving, and more.</p>
          <div className="hero-buttons">
            <Link to="/register" className="btn">Get Started</Link>
            <Link to="/login" className="btn btn-outline">Login</Link>
          </div>
        </div>
        <div className="hero-image">
          <img src={heroImg} alt="TutorAI illustration" />
        </div>
      </div>
    </div>
  );
};

export default Home;

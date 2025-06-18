import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Account from "./components/Account";
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<Chat />} />
	  <Route path="/account" element={<Account />} />
	  <Route path="/dashboard" element={<Dashboard />} />
	  <Route path="/quiz" element={<Quiz />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;

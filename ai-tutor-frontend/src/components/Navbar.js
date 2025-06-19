import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);

    const verifyUser = async () => {
      if (!token) return;
      try {
        const res = await fetch("https://ai-tutor-project.onrender.com/api/account", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          setIsAuthenticated(false);
          localStorage.removeItem("token");
        }
      } catch {
        setIsAuthenticated(false);
        localStorage.removeItem("token");
      }
    };

    verifyUser();
    window.addEventListener("storage", verifyUser);
    return () => window.removeEventListener("storage", verifyUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-header">
        <Link to="/" className="nav-logo" onClick={() => setMenuOpen(false)}>
          TutorAI
        </Link>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </div>

      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
        {isAuthenticated && <Link to="/chat" onClick={() => setMenuOpen(false)}>Chat</Link>}
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link to="/account" onClick={() => setMenuOpen(false)}>Account</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

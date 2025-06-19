import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const res = await fetch("https://ai-tutor-project.onrender.com/api/account", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.error("Auth check failed", err);
        setIsAuthenticated(false);
        localStorage.removeItem("token");
      }
    };

    window.addEventListener("storage", verifyUser);
    verifyUser();

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
      <div className="nav-logo">TutorAI</div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        {isAuthenticated && <Link to="/chat">Chat</Link>}
        {isAuthenticated ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/account">Account</Link>
            <button
              onClick={handleLogout}
              style={{
                marginLeft: "1rem",
                cursor: "pointer",
                background: "none",
                border: "none",
                fontWeight: "500",
                color: "#dc3545",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

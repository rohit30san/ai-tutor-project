import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/account.css";

const Account = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    fetch("http://localhost:5000/api/account", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setUser(data);
      })
      .catch(err => {
        console.error(err);
        navigate("/login");
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-4 max-w-md mx-auto bg-white shadow rounded-xl mt-10">
      <h2 className="text-xl font-bold mb-4">Account Details</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <button
  	className="logout-btn"
  	onClick={() => {
    	localStorage.removeItem("token");
    	window.location.href = "/login";}}>
  	Logout
      </button>
    </div>
  );
};

export default Account;

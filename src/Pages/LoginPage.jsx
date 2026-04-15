import React from "react";
import { useState } from "react";
// import axios from "axios";
import API from "../api/axios";
import { Link , useNavigate } from "react-router-dom";

export default function LoginPage() {

  const [form, setForm] = useState({Email: "",password: "",});

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/api/auth/loginUser",form);
      console.log("Response From Login Api :- ",res);
      
      localStorage.setItem("user", JSON.stringify(res.data.data.user));
      localStorage.setItem("token", res.data.data.accessToken);

      alert("Login Success");

      navigate("/chat");

    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input placeholder="Email"
          onChange={(e)=>setForm({...form, Email:e.target.value})}
        />

        <input type="password" placeholder="Password"
          onChange={(e)=>setForm({...form, password:e.target.value})}
        />

        <button type="submit">Login</button>
      </form>

      <div className="auth-link">
        <Link to="/register">Create account</Link>
      </div>
    </div>
  );
}

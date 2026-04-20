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

      //alert("Login Success");

      navigate("/chat");

    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
  <div className="auth-wrapper">
    <div className="auth-card">

      <div className="auth-header">
        <h2>Welcome Back 👋</h2>
        <p>Login to continue chatting</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">

        <div className="input-group">
          <input
            placeholder="Email Address"
            onChange={(e)=>setForm({...form, Email:e.target.value})}
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            placeholder="Password"
            onChange={(e)=>setForm({...form, password:e.target.value})}
          />
        </div>

        <button type="submit" className="auth-btn">
          Login
        </button>

      </form>

      <div className="auth-footer">
        <p>Don't have an account?</p>
        <Link to="/register">Create Account</Link>
      </div>

    </div>
  </div>
);
}

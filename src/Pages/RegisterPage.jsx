import React from 'react';
import { useState } from 'react';
// import axios from "axios";
import API from "../api/axios";
import { Link , useNavigate } from "react-router-dom";

export default function RegisterPage() {

  const [form, setForm] = useState({Name: "",Mobile: "",Gender: "",Email: "",password: "",});
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/api/auth/registerUser", form);
      console.log("Response From Register Api :- ",res);
      
      alert("Registered Successfully");
      navigate("/");
      
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <input placeholder="Name" onChange={(e)=>setForm({...form, Name:e.target.value})}/>
        <input placeholder="Mobile" onChange={(e)=>setForm({...form, Mobile:e.target.value})}/>
        
        <input placeholder="Gender" onChange={(e)=>setForm({...form, Gender:e.target.value})}/>
        
        <input placeholder="Email" onChange={(e)=>setForm({...form, Email:e.target.value})}/>
        
        <input type="password" placeholder="Password"
          onChange={(e)=>setForm({...form, password:e.target.value})}
        />

        <button type="submit">Register</button>
      </form>

      <div className="auth-link">
        <Link to="/">Already have account?</Link>
      </div>
    </div>
  );
}

import React from "react";
import { useState } from "react";
import API from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../Redux/slices/userSlice";
// import "../Styles/Auth.css";

export default function RegisterPage() {

  const [form, setForm] = useState({Name: "",Mobile: "",Gender: "",Email: "",password: "",bio: ""});
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      if (file) {
        formData.append("profilePicture", file);
      }

      const res = await API.post("/api/auth/registerUser", formData);
      console.log("Register Response:", res);

      const { user, accessToken } = res.data.data;

      dispatch(setUser(user));

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", accessToken);

      navigate("/chat");

    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

 return (
  <div className="auth-wrapper">
    <div className="auth-card">

      <div className="auth-header">
        <h2>Create Account</h2>
        <p>Join and start chatting instantly</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">

        <div className="input-group">
          <input
            placeholder="Full Name"
            onChange={(e) => setForm({ ...form, Name: e.target.value })}
          />
        </div>

        <div className="input-group">
          <input
            placeholder="Mobile Number"
            onChange={(e) => setForm({ ...form, Mobile: e.target.value })}
          />
        </div>

        <div className="input-group">
          <select
            onChange={(e) => setForm({ ...form, Gender: e.target.value })}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div className="input-group">
          <input
            placeholder="Email Address"
            onChange={(e) => setForm({ ...form, Email: e.target.value })}
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <div className="input-group">
          <input
            placeholder="Bio"
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>

        <div className="file-upload">
          <label>Upload Profile Picture</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        <button type="submit" className="auth-btn">
          Register
        </button>

      </form>

      <div className="auth-footer">
        <p>Already have an account?</p>
        <Link to="/">Login</Link>
      </div>

    </div>
  </div>
);
}
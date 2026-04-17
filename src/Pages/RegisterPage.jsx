import React from "react";
import { useState } from "react";
import API from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../Redux/slices/userSlice";

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
    <div className="auth-container">
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>

        <input
          placeholder="Name"
          onChange={(e) => setForm({ ...form, Name: e.target.value })}
        />

        <input
          placeholder="Mobile"
          onChange={(e) => setForm({ ...form, Mobile: e.target.value })}
        />

        <select onChange={(e) => setForm({ ...form, Gender: e.target.value })}>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <input
          placeholder="Email"
          onChange={(e) => setForm({ ...form, Email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <input
          placeholder="Bio"
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />
        
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button type="submit">Register</button>
      </form>

      <div className="auth-link">
        <Link to="/">Already have account?</Link>
      </div>
    </div>
  );
}
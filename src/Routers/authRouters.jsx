import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterPage from '../Pages/RegisterPage';
import LoginPage from "../Pages/LoginPage";
import Chat from '../Pages/Chat';
import Profile from "../Pages/Profile";

export default function AuthRouters(){

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path = "/chat" element={<Chat/>}/>
        <Route path = "/Profile" element={<Profile/>}/>
      </Routes>
    </BrowserRouter>
  )
}

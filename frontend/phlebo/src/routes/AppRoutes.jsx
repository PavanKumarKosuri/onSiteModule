/* eslint-disable no-unused-vars */
// phlebo\src\routes\AppRoutes.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login.jsx";
import LtPage from "../components/Login/LtPage";
import SampleCollection from "../components/Login/Options/SampleCollection.jsx";
import Settings from "../components/Login/Options/Settings.jsx";
import Home from "../pages/Home.jsx";
import Register from "../pages/Register.jsx";

function AppRoutes() {
  const [islt, setIslt] = useState(false);
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      setIslt(true);
    }
  }, []);
  const handleltLogin = (loginStatus) => {
    setIslt(loginStatus);
  };
  const handleLogout = () => {
    setIslt(false);
    localStorage.removeItem("accessToken");
  };
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login onltLogin={handleltLogin} />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/lt"
        element={
          islt ? (
            <LtPage onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      >
        <Route index element={<SampleCollection />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;

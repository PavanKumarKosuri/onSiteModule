/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login.jsx";
import SuperAdminHome from "../pages/SuperAdminHome.jsx";
import "../App.css";
import Dashboard from "../components/SuperAdmin/Options/Dashboard.jsx";
import GenerateQR from "../components/SuperAdmin/Options/GenerateQR.jsx";
import GetReports from "../components/SuperAdmin/Options/GetReports.jsx";
import Settings from "../components/SuperAdmin/Options/Settings.jsx";
import Registrations from "../components/SuperAdmin/Options/Registrations.jsx";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      setIsAdmin(true);
    }
  }, []);

  const handleAdminLogin = (loginStatus) => {
    setIsAdmin(loginStatus);
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("accessToken");
  };

  return (
    <Routes>
      <Route path="/" element={<Login onAdminLogin={handleAdminLogin} />} />
      <Route
        path="/admin-dashboard"
        element={
          isAdmin ? (
            <SuperAdminHome onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="generateqr" element={<GenerateQR />} />
        <Route path="reports" element={<GetReports />} />
        <Route path="registrations" element={<Registrations />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;

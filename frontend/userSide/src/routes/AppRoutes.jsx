/* eslint-disable no-unused-vars */
// userSide\src\routes\AppRoutes.jsx
import { api_url } from "../../apiLink.js";
import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage.jsx";
import UserDetailsPage from "../pages/UserDetailsPage";
import ReportsPage from "../pages/ReportsPage";
import "../App.css";
import axios from "axios";

function App() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      setIsAdmin(true);
    }
  }, []);

  const handlePhoneNumberSubmit = async (number) => {
    setPhoneNumber(number);
    try {
      const response = await axios.post(`${api_url}/api/user`, {
        phoneNumber: number,
      });
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  return (
    <Routes>
      <Route
        path="/home-page/:city/:companyName/:uniqueKey"
        element={<HomePage onPhoneNumberSubmit={handlePhoneNumberSubmit} />}
      />
      <Route
        path="/user-details/:city/:companyName/:uniqueKey"
        element={
          <UserDetailsPage phoneNumber={phoneNumber} userData={userData} />
        }
      />
      <Route
        path="/reports"
        element={<ReportsPage phoneNumber={phoneNumber} userData={userData} />}
      />
    </Routes>
  );
}

export default App;

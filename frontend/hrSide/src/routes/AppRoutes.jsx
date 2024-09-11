// hrSide\src\routes\AppRoutes.jsx
/* eslint-disable no-unused-vars */
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/hrpage/:city/:companyName/:uniqueKey" element={<Home />} />
    </Routes>
  );
}

export default AppRoutes;

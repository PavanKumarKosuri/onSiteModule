/* eslint-disable no-unused-vars */
import React from "react";
import { HashRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.jsx";

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
